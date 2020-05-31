import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import HypeHeader from "../headerFooter/HypeHeader";
import HypeFooter from "../headerFooter/HypeFooter";
import HypeCard from "../hype-card/HypeCard";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    // width: "100vw",
  },
}));

type Props = {};

function HypeExternalMissingInfo(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <HypeHeader />
      <HypeCard
        headerText="Testing"
        backArrow="link"
        backArrowLink="/"
        width={450}
        loading={false}
      >
        <p>Hello world</p>
      </HypeCard>
      <HypeFooter />
    </div>
  );
}

export default HypeExternalMissingInfo;
