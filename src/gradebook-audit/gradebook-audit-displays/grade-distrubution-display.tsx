import * as React from "react";
import { GradeDistribution, TeacherClass } from "../gradebook-audit-interfaces";
import { Chart } from "react-google-charts";

interface MiniFailing {
  studentName: string;
  studentID: string | number;
  quarterGrade: number | string;
  dl?: string; // PDIS
  el?: string; // ELL
}

interface GradeDistributionProps {
  distribution: GradeDistribution;
  className: string;
  classSize?: number;
  failing: MiniFailing[];
  showSpedCols: boolean;
}

interface GradeDistributionDisplayProps {
  classes: { [className: string]: TeacherClass };
  hasGrades: string[];
  noGrades: string[];
  // pass this if you want PDIS/ELL columns to appear (same condition as your FailingGradesRender)
  hasSped?: boolean;
}

/** -------- per-class block: chart + failing table underneath -------- */
const GradeDistributionRender: React.SFC<GradeDistributionProps> = (props) => {
  const gd = props.distribution;

  const classSize =
    props.classSize ??
    (gd?.A ?? 0) +
      (gd?.B ?? 0) +
      (gd?.C ?? 0) +
      (gd?.D ?? 0) +
      (gd?.F ?? 0) +
      (gd?.Blank ?? 0);

  return (
    <div
      className="grade-distribution-container"
      style={{ width: 360, pageBreakInside: "avoid" }}
    >
      <h5 className="grade-distribution-header">{props.className}</h5>

      {/* chart */}
      <Chart
        width={"100%"}
        height={"160px"}
        chartType="ColumnChart"
        data={[
          ["Grade", "Count", { role: "style" }, { role: "annotation" }],
          ["A", gd.A, "green", "A"],
          ["B", gd.B, "blue", "B"],
          ["C", gd.C, "yellow", "C"],
          ["D", gd.D, "orange", "D"],
          ["F", gd.F, "red", "F"],
          ["Blank", gd.Blank, "grey", "Blank"],
        ]}
        options={{
          legend: { position: "none" },
          chartArea: { width: "85%" },
          hAxis: { textPosition: "none" },
          vAxis: { minValue: 0 },
        }}
      />

      {/* failing block directly under the chart */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 12, margin: "2px 0" }}>
          Class Size: {classSize || "—"}
        </div>
        <div style={{ fontSize: 12, margin: "2px 0" }}>
          {props.failing.length} Students Failing:
        </div>

        <table className="data-table" style={{ width: "100%", marginTop: 6 }}>
          <tbody>
            <tr className="gradebook-header-row">
              <th>Student Name</th>
              <th>Student ID</th>
              <th>Quarter Grade</th>
              {props.showSpedCols ? (
                <>
                  <th>PDIS</th>
                  <th>ELL</th>
                </>
              ) : null}
            </tr>

            {/* show first 4–5 rows to keep the card compact; adjust as needed */}
            {(props.failing.length
              ? props.failing
              : Array.from({ length: 4 }).map(() => ({} as MiniFailing))
            )
              .slice(0, 5)
              .map((s, i) => (
                <tr key={i}>
                  <td>{s.studentName ?? ""}</td>
                  <td>{s.studentID ?? ""}</td>
                  <td>{s.quarterGrade ?? ""}</td>
                  {props.showSpedCols ? (
                    <>
                      <td>{s.dl ?? ""}</td>
                      <td>{s.el ?? ""}</td>
                    </>
                  ) : null}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/** -------- wrapper that maps each class to a stacked “card” -------- */
export const GradeDistributionDisplay: React.SFC<
  GradeDistributionDisplayProps
> = (props) => {
  return (
    <div>
      <h3>Grade Distributions</h3>

      {props.noGrades.length > 0 ? (
        <div style={{ fontStyle: "italic" }}>
          {"No Grades: " +
            props.noGrades.map((gr) => props.classes[gr].className)}
          <hr />
        </div>
      ) : null}

      <div
        className="grade-distributions"
        style={{ display: "flex", flexWrap: "wrap", gap: 24 }}
      >
        {props.hasGrades.map((classKey, i) => {
          const cls = props.classes[classKey];
          const dist = cls.distribution;

          const classSize =
            (cls as any).classSize ??
            (dist?.A ?? 0) +
              (dist?.B ?? 0) +
              (dist?.C ?? 0) +
              (dist?.D ?? 0) +
              (dist?.F ?? 0) +
              (dist?.Blank ?? 0);

          // source is the same one FailingGradesRender uses
          const failing = (dist as any).failingStudents ?? [];

          return (
            <GradeDistributionRender
              key={i}
              distribution={dist}
              className={cls.className}
              classSize={classSize}
              failing={failing}
              showSpedCols={!!props.hasSped}
            />
          );
        })}
      </div>
    </div>
  );
};
