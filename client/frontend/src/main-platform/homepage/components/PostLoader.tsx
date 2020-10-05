import React, { useState, useEffect, useCallback, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {
  children?: React.ReactNode;
  lastValue: string;
  getValues: () => any;
};

function Loader(props: Props) {
  const styles = useStyles();
  const [page, setPage] = useState(1);
  const [currentValues, setCurrentValues] = useState<number[]>([]);

  let bottomBoundaryRef = useRef(null);
  const scrollObserver = useCallback(
    (node: any) => {
      const intObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0) {
            console.log('Page:', page);
            setPage(page + 1);
            intObs.unobserve(node);
          }
        });
      });
      intObs.observe(node);
    },
    [page]
  );

  useEffect(() => {
    if (bottomBoundaryRef.current) {
      scrollObserver(bottomBoundaryRef.current);
    }
  }, [scrollObserver, bottomBoundaryRef]);

  useEffect(() => {
    setCurrentValues([
      ...currentValues.slice(4, currentValues.length),
      // ...getValues(page),
      props.getValues(),
    ]);
  }, [page]);

  return (
    <div className={styles.wrapper}>
      {props.children}
      <div
        id="page-bottom-boundary"
        ref={bottomBoundaryRef}
        style={{ border: '1px solid red' }}
      ></div>
    </div>
  );
}

export default Loader;
