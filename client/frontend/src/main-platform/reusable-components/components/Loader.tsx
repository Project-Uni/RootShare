import React, { useState, useEffect, useCallback, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';
import { colors } from '../../../theme/Colors';
import { usePrevious } from '../../../helpers/hooks';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  loadingIndicator: {
    marginTop: 70,
    color: colors.primary,
  },
}));

type Props = {
  values: JSX.Element[];
  numRendered: number;
  numUpdated: number;
  getValues: () => any;
  loading: boolean;
};

// Strategy: Load initial Data (Large).
// Render small subset, once you reach the bottom of that subset, load the next subset.
// Once we have reached the last subset, fetch the next batch of data.
// Dont remove previous data from memory. This should help with scrolling up logic

function Loader(props: Props) {
  const styles = useStyles();
  const [initialized, setInitialized] = useState(false);
  const [page, setPage] = useState(1);

  const [allValues, setAllValues] = useState<JSX.Element[]>([]);
  const [renderedValues, setRenderedValues] = useState<JSX.Element[]>([]);

  const prevPage = usePrevious(page);

  const [inProgress, setInProgress] = useState(true);
  var firstRenderedIndex = useRef<number>(0);
  var lastRenderedIndex = useRef<number>(0)

  let bottomBoundaryRef = useRef(null);
  let topBoundaryRef = useRef(null);

  const scrollObserver = useCallback(
    (node: any, direction: 'top' | 'bottom') => {
      const intObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0 && !inProgress && initialized) {
            if (direction === 'bottom') setPage(page + 1);
            else if (direction === 'top' && firstRenderedIndex.current > 0) setPage(page - 1);
            intObs.unobserve(node);
          }
        });
      });
      intObs.observe(node);
    },
    [page, inProgress, initialized]
  );

  useEffect(() => {
    if (bottomBoundaryRef.current) {
      scrollObserver(bottomBoundaryRef.current, 'bottom');
    }
    if (topBoundaryRef.current) {
      scrollObserver(topBoundaryRef.current, 'top');
    }
  }, [scrollObserver, bottomBoundaryRef, topBoundaryRef]);

  useEffect(() => {
    setAllValues(props.values);
    if(!initialized && props.values.length > 0) {
      setRenderedValues(props.values.slice(0, Math.min(props.numRendered, props.values.length)))
      lastRenderedIndex.current = Math.min(props.values.length, props.numRendered - 1);
      setInitialized(true)
      setTimeout(()=>{
        setInProgress(false)
      }, 1000)
    }
  }, [props.values]);

  useEffect(() => {
    if(initialized) {
      updateRender()
    }
  }, [page]);

  async function updateRender() {
    setInProgress(true);
    if (page > (prevPage || 0)) {
      if (lastRenderedIndex.current >= allValues.length - 1) {
        await props.getValues();
      } else {
        setRenderedValues(
          allValues.slice(
            firstRenderedIndex.current + props.numUpdated,
            Math.min(lastRenderedIndex.current + props.numUpdated, allValues.length)
          )
        );

        firstRenderedIndex.current += props.numUpdated;
        lastRenderedIndex.current +=
          lastRenderedIndex.current + props.numUpdated < allValues.length
            ? props.numUpdated
            : allValues.length - lastRenderedIndex.current - 1;
      }
    } else {
      setRenderedValues(allValues.slice(firstRenderedIndex.current - props.numUpdated, lastRenderedIndex.current - props.numUpdated))
      firstRenderedIndex.current -= props.numUpdated;
      lastRenderedIndex.current -= props.numUpdated;
    }
    setTimeout(() => {
      setInProgress(false);
    }, 1000);
  }

  return (
    <div className={styles.wrapper}>
      <div
        id="page-top-boundary"
        ref={topBoundaryRef}
        style={{ border: '1px solid red' }}
      ></div>
      {renderedValues}
      {props.loading && (
        <CircularProgress size={100} className={styles.loadingIndicator} />
      )}
      <div
        id="page-bottom-boundary"
        ref={bottomBoundaryRef}
        style={{ border: '1px solid red' }}
      ></div>
    </div>
  );
}

export default Loader;
