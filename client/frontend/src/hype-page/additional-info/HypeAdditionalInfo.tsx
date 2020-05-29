import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  TextField,
  Button,
  LinearProgress,
} from "@material-ui/core";
import { FaArrowLeft } from "react-icons/fa";

import RootShareLogoFull from "../../images/RootShareLogoFull.png";

import HypeHeader from "../headerFooter/HypeHeader";
import HypeFooter from "../headerFooter/HypeFooter";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  body: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  card: {
    width: 400,
  },
  cardContent: {
    paddingTop: "30px",
  },
  linearProgress: {
    backgroundColor: "rgb(30, 67, 201)",
  },
  linearProgressBg: {
    backgroundColor: "rgb(140, 165, 255)",
  },
  linearProgressRoot: {
    height: 5,
  },
  backArrow: {
    float: "left",
    marginLeft: "10px",
    verticalAlign: "center",
    marginTop: "13px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  rootshareLogo: {
    height: "80px",
  },
  header: {
    fontSize: "14pt",
    fontWeight: "bold",
    fontFamily: "Ubuntu",
    marginBottom: 0,
  },
}));

type Props = {};

function HypeAdditionalInfo(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);

  return (
    <div className={styles.wrapper}>
      <HypeHeader />
      <div className={styles.body}>
        <Card raised className={styles.card}>
          <LinearProgress
            classes={{
              root: styles.linearProgressRoot,
              barColorPrimary: styles.linearProgress,
              colorPrimary: styles.linearProgressBg,
            }}
            variant={loading ? "indeterminate" : "determinate"}
            value={100}
          />
          <CardContent>
            <a href="/" className={styles.backArrow}>
              <FaArrowLeft color={"rgb(30, 67, 201)"} size={24} />
            </a>
            <img
              src={RootShareLogoFull}
              className={styles.rootshareLogo}
              alt="RootShare"
            />
            <p className={styles.header}>Complete your profile</p>
          </CardContent>
        </Card>
      </div>

      <HypeFooter />
    </div>
  );
}

export default HypeAdditionalInfo;
