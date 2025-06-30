import React, { useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
type tablePros = {
  data: any[];
  headerString: string[];
  fields: string[];
  showHeader: boolean;
  className? : string;
};
const NrjMatTbl = (props: tablePros) => {
  let sz: number = 0;
  if (props.data) {
    sz = 1;
  }
  useEffect(() => {
  }, [props.data]);
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: "90%" }} aria-label="simple table" className={props.className ?props.className : ""}>
        <TableHead>
          <TableRow>
            {props.showHeader &&
              props.headerString.map((hd) => <TableCell>{hd}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          
          {props.data.map((row) => (
            <TableRow
              key={row["id"]}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {props.fields.map((fld) => (
                <TableCell style={{ borderBottom: 2 }}>{row[fld]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default React.memo(NrjMatTbl);
