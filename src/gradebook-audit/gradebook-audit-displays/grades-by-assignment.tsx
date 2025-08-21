import * as React from "react";

import {
  GradeLogic,
  AssignmentImpact,
  TeacherClass,
} from "../gradebook-audit-interfaces";

// chart
import { StackedGradeBars } from "../stacked-grade-bars";

interface GradesByAssignmentProps {
  classes: { [className: string]: TeacherClass };
  hasAsign: string[];
}

export class GradesByAssignmentRender extends React.PureComponent<GradesByAssignmentProps> {
  render() {
    return (
      <>
        <h3>Assignment Grades</h3>
        {this.props.hasAsign.map((k) => (
          <ClassAssignmentBreakdown
            classAssignments={this.props.classes[k]}
            class={this.props.classes[k].className}
            key={k}
          />
        ))}
      </>
    );
  }
}

const ClassAssignmentBreakdown: React.SFC<{
  classAssignments: TeacherClass;
  class: string;
}> = (props) => {
  const cats = props.classAssignments.categories;
  const tpl = props.classAssignments.tpl;
  const weightStr =
    tpl === "Categories only" ? "Weight Per Asg" : "Assignment Weight";

  const header = (
    <tr key="head">
      <th>Category</th>
      <th>Weight</th>
      <th>{weightStr}</th>
      <th>Assignment</th>
      <th># Graded</th>
      <th>%A's</th>
      <th>%B's</th>
      <th>%C's</th>
      <th>%D's</th>
      <th>%F's</th>
    </tr>
  );

  // visible subheader right under the chart
  const SubHeaderRow: React.FC = () => (
    <tr className="subheader-row">
      <th>Category</th>
      <th>Weight</th>
      <th>{weightStr}</th>
      <th>Assignment</th>
      <th># Graded</th>
      <th>%A's</th>
      <th>%B's</th>
      <th>%C's</th>
      <th>%D's</th>
      <th>%F's</th>
    </tr>
  );

  // ⬇️ helper to build chart data for one category
  const toChartData = (category: AssignmentImpact[]) => {
    const pct = (n: number, d: number) => (d ? (n / d) * 100 : 0);
    return category
      .filter((a) => a.stats?.grades && a.stats.grades.length > 0)
      .map((a) => {
        const grades = a.stats?.grades ?? [];
        const total = grades.length;
        return {
          name: a.assignmentName,
          A: +pct(grades.filter((g) => g > 89).length, total).toFixed(1),
          B: +pct(grades.filter((g) => g > 79 && g < 90).length, total).toFixed(
            1
          ),
          C: +pct(grades.filter((g) => g > 69 && g < 80).length, total).toFixed(
            1
          ),
          D: +pct(grades.filter((g) => g > 59 && g < 70).length, total).toFixed(
            1
          ),
          F: +pct(grades.filter((g) => g < 59).length, total).toFixed(1),
          graded: total,
        };
      });
  };

  const pctTotal = (count: number, total: number) =>
    total ? ((count / total) * 100).toFixed(1) + "%" : "0.0%";

  const CatDisplay = (
    category: AssignmentImpact[],
    name: string
  ): JSX.Element => {
    if (category.length === 0) {
      return <React.Fragment key={name} />;
    }

    const sorted = [...category].sort((a, b) =>
      b.dueDate > a.dueDate ? -1 : 1
    );

    const rows: JSX.Element[] = [];
    let totals: number[] = [];

    sorted.forEach((a, i) => {
      const grades = a.stats?.grades ?? [];
      if (grades.length) {
        const total = grades.length;
        totals = totals.concat(grades);
        rows.push(
          <tr key={a.assignmentName}>
            {i === 0 ? (
              <>
                <td className="index-column" rowSpan={sorted.length}>
                  {name}
                </td>
                <td rowSpan={sorted.length}>{sorted[0].categoryWeight}%</td>
                {tpl === "Categories only" ||
                tpl === "Categories and assignments" ? (
                  <td rowSpan={sorted.length}>{a.impact.toFixed(2) + "%"}</td>
                ) : null}
              </>
            ) : null}
            {tpl !== "Categories only" ? (
              <td>{a.impact.toFixed(2) + "%"}</td>
            ) : null}
            <td>{a.assignmentName}</td>
            <td>{total}</td>
            <td>{pctTotal(grades.filter((g) => g > 89).length, total)}</td>
            <td>
              {pctTotal(grades.filter((g) => g > 79 && g < 90).length, total)}
            </td>
            <td>
              {pctTotal(grades.filter((g) => g > 69 && g < 80).length, total)}
            </td>
            <td>
              {pctTotal(grades.filter((g) => g > 59 && g < 70).length, total)}
            </td>
            <td>{pctTotal(grades.filter((g) => g < 59).length, total)}</td>
          </tr>
        );
      }
    });

    const totalLen = totals.length;
    rows.push(
      <tr key="total">
        <td colSpan={4} style={{ textAlign: "right" }} className="index-column">
          Total
        </td>
        <td className="index-column">{totalLen}</td>
        <td className="index-column">
          {pctTotal(totals.filter((g) => g > 89).length, totalLen)}
        </td>
        <td className="index-column">
          {pctTotal(totals.filter((g) => g > 79 && g < 90).length, totalLen)}
        </td>
        <td className="index-column">
          {pctTotal(totals.filter((g) => g > 69 && g < 80).length, totalLen)}
        </td>
        <td className="index-column">
          {pctTotal(totals.filter((g) => g > 59 && g < 70).length, totalLen)}
        </td>
        <td className="index-column">
          {pctTotal(totals.filter((g) => g < 59).length, totalLen)}
        </td>
      </tr>
    );

    // ⬇️ chart row + visual subheader under it
    return (
      <React.Fragment key={name}>
        <tr>
          <td colSpan={10} className="chart-cell">
            <StackedGradeBars
              data={toChartData(sorted)}
              title={`${name} (${sorted[0].categoryWeight}%)`}
              height={260} // optional (defaults to 260)
            />
          </td>
        </tr>

        <SubHeaderRow />
        {rows}
      </React.Fragment>
    );
  };

  return (
    <React.Fragment key={props.class}>
      <h4>{props.class}</h4>
      <table className="data-table">
        {/* keep semantics; hide visually with CSS .real-head */}
        <thead className="real-head">{header}</thead>
        <tbody>
          {Object.keys(cats).map((a) =>
            CatDisplay(cats[a].assignments as AssignmentImpact[], a)
          )}
        </tbody>
      </table>
    </React.Fragment>
  );
};
