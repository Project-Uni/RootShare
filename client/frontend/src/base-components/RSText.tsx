import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((_: any) => ({
  title: {
    fontFamily: "Raleway"
  },
  normal: {
    fontFamily: "Lato"
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
}));

type Props = {
  type?: "head" | "subhead" | "body";
  bold?: boolean;
  italic?: boolean;
  size?: number;
  className?: string;
  children: React.ReactNode;
};

function RSText(props: Props) {
  const styles = useStyles();

  const type = props.type ? props.type : "body";

  return (
    <p
      className={[
        type === "head" ? styles.title : styles.normal,
        props.bold ? styles.bold : null,
        props.italic ? styles.italic : null,
        props.className ? props.className : null,
      ].join(" ")}
      style={{ fontSize: props.size ? `${props.size}pt` : "12pt" }}
    >
      {props.children}
    </p>
  );
}

export default RSText;
