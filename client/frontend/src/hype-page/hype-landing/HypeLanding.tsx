import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {};

function HypeLanding(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <p>I am the placeholder for the hype page</p>
      <a href="/register">Register</a>
    </div>
  );
}

export default HypeLanding;
