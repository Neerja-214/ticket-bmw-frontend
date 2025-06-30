import { Table, Button } from "rsuite";
const { Column, HeaderCell, Cell } = Table;

function gridCols(parms: string) {
  if (parms === "PageLink") {
    const colList = [];
    colList.push(
      <Column width={10} align="center" fixed>
        <HeaderCell>Id</HeaderCell>
        <Cell dataKey="id"></Cell>
      </Column>
    );
    colList.push(
      <Column width={500} align="center" fixed>
        <HeaderCell>Details</HeaderCell>
        <Cell dataKey="dts"></Cell>
      </Column>
    );
    return colList;
  }
}

