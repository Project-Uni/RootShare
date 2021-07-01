import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { RSText } from '../../../base-components';
import { RSLink } from '../';
import Theme, { addAlpha } from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  iconButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    padding: 8,
    borderRadius: 100,
  },
}));

type Props = {
  Icon: any; //JSX.Element
  iconSize: number;
  text?: string;
  textSize: number;
  selected?: boolean;
  primaryColor: string;
  highlightColor: string;
  variant: 'static' | 'dynamic';
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export const RSIconButton = (props: Props) => {
  const styles = useStyles();

  const {
    Icon,
    text,
    iconSize,
    textSize,
    selected,
    primaryColor,
    highlightColor,
    variant,
    onClick,
    className,
  } = props;

  const [hovering, setHovering] = useState(false);
  const [hoveringDelayed, setHoveringDelayed] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [buttonColor, setButtonColor] = useState(
    selected ? highlightColor : primaryColor
  );
  const [backgroundColor, setBackgroundColor] = useState(
    addAlpha(highlightColor, 0.15)
  );

  useEffect(() => {
    setBackgroundColor(addAlpha(buttonColor, mouseDown ? 0.25 : 0.15));
  }, [hovering, mouseDown, buttonColor]);

  useEffect(() => {
    if (hovering) {
      setHoveringDelayed(true);
      setHovering(false);
    }
  }, [hovering]);

  useEffect(() => {
    setButtonColor(selected ? highlightColor : primaryColor);
  }, [selected]);

  const getTransitionStyle = () => {
    if (hovering) return { backgroundColor };
    if (hoveringDelayed)
      return {
        transition: 'background-color 0.15s ease-out',
        backgroundColor,
      };

    return {};
  };

  return (
    <div
      onMouseDown={() => setMouseDown(true)}
      onMouseEnter={() => setHovering(true)}
      onMouseUp={() => {
        if (mouseDown) {
          onClick();
          setMouseDown(false);
        }
      }}
      onMouseLeave={() => {
        setMouseDown(false);
        setHovering(false);
        setHoveringDelayed(false);
      }}
      className={[styles.wrapper, className].join(' ')}
      style={props.style}
    >
      {text && (
        <RSText color={buttonColor} size={textSize} style={{ userSelect: 'none' }}>
          {text}
        </RSText>
      )}
      <div className={styles.iconButton} style={getTransitionStyle()}>
        <Icon
          style={{
            fontSize: iconSize,
            color: buttonColor,
          }}
        />
      </div>
    </div>
  );
};

RSIconButton.defaultProps = {
  textSize: 12,
  iconSize: 16,
  primaryColor: Theme.primaryText,
  highlightColor: Theme.primaryText,
  hoverColor: Theme.primaryText,
  variant: 'static',
  onClick: () => {},
};
