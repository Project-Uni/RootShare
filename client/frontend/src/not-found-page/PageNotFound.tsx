import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import RSText from "../base-components/RSText";
import HypeHeader from "../hype-page/headerFooter/HypeHeader";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: "100vw",
    height: "100vh",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: window.innerHeight - 60,
  },
  RSText: {
    width: "100vw",
    textAlign: "center",
    marginTop: 100,
  },
}));

type Props = {};

export default function PageNotFound(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <HypeHeader />
      <div className={styles.body}>
        <RSText type="head" className={styles.RSText} size={32}>
          404 Error: Page Not Found
        </RSText>
      </div>
    </div>
  );
}
