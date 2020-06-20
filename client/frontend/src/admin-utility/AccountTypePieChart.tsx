import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Pie, Doughnut } from "react-chartjs-2";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {
  mode: "pie" | "doughnut";
  data?: { [key: string]: any };
};

function AccountTypePieChart(props: Props) {
  const styles = useStyles();
  const data = {
    labels: ["Student", "Alumni", "Faculty", "Fan"],
    datasets: [
      {
        label: "Count",
        backgroundColor: ["maroon", "navy", "darkgreen", "gold"],
        hoverBackgroundColor: ["red", "lightblue", "lightgreen", "yellow"],
        data: [59, 40, 11, 22],
      },
    ],
  };

  return (
    <div className={styles.wrapper}>
      {props.mode === "pie" ? (
        <Pie
          data={data}
          options={{
            legend: {
              display: true,
              position: "left",
              labels: { boxWidth: 40 },
            },
          }}
        />
      ) : (
        <Doughnut
          data={data}
          options={{
            legend: {
              display: true,
              position: "left",
              labels: { boxWidth: 40 },
            },
          }}
        />
      )}
    </div>
  );
}

export default AccountTypePieChart;
