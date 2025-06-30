import React from "react";
import { Modal, Button, ButtonToolbar, Placeholder, Input } from "rsuite";

type NrjModal = {
  title: string;
  typr: string;
  db: string;
  callMe: boolean;
  onClose: () => void;
  onSaveMst: (data: string) => void;
};
const NrjWtrCmbMst = (props: NrjModal) => {
  const { onClose, onSaveMst } = props;
  const [txtMst, setTxtMst] = React.useState("");
  const handleClose = () => {
    onClose();
  };
  const txtValue = (event: any) => {
    let vl: string = event.target.value;
    setTxtMst(vl);
  };

  const handleSave = () => {
    let api: string = txtMst;
    if (api) {
      onSaveMst(api);
    }
  };

  const Change = (event : any) =>{
    setTxtMst(event.target.value)
  }

  return (
    <>
      <Modal open={props.callMe} onClose={handleClose}>
        <Modal.Header>
          <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Input
            type="text"
            // value={txtMst}
            onChange={Change}
            onBlur={txtValue}
            style={{ width: 350 }}
            // onFocus={}
            placeholder={"Enter Master Value ... Will check for Duplicate Entry !!"}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSave} appearance="primary">
            Save
          </Button>
          <Button onClick={handleClose}  appearance="subtle">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default React.memo(NrjWtrCmbMst);
