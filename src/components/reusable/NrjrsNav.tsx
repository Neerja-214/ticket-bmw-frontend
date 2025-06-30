import React from "react";
import { Navbar, Nav } from "rsuite";
import NavItem from "rsuite/esm/Nav/NavItem";

const NrjrsNav = () => {
  const cmp: string = sessionStorage.getItem("cmpnm") || "Neerja Asscoiates";
  return (
    <Navbar appearance="inverse">
      <Navbar.Brand href="#" style={{ fontSize: 20 }}>
        {cmp}
      </Navbar.Brand>
      <Nav>
        <Nav.Item href="/">Home</Nav.Item>
        <Nav.Menu title="Admin">
          <NavItem href="/LinkDts" style={{ display: "block", width: 120 }}>
            Link Library
          </NavItem>
        </Nav.Menu>
        <Nav.Menu title="Tenders">
            <NavItem href="/gbleml" style={{ display: "block", width: 200 }}>
               E Mail List Global 
            </NavItem>
            <NavItem href="/prjtnd" style={{ display: "block", width: 120 }}>
               Project Details
            </NavItem>
            <NavItem href="/prjlst" style={{ display: "block", width: 120 }}>
               List of Projects
            </NavItem>
            <NavItem href="/emd" style={{ display: "block", width: 200 }}>
               EMD Bank Guarantee
            </NavItem>
          </Nav.Menu>
          
          
          
        <Nav.Menu title="Waste Related">
          <Nav.Menu title="Incinerators">
            <NavItem
              className="ms-auto"
              active={true}
              href="/icncr"
              style={{ display: "block", width: 120 }}
            >
              Incinerators
            </NavItem>
            <NavItem  href="/icntdy" style={{ display: "block", width: "auto" }}>
              Active Waste Collection
            </NavItem>
          </Nav.Menu>
          <NavItem
            active={true}
            href="/indpcw"
            style={{ display: "block", width: 120 }}
            
          >
            HCF - Centre
          </NavItem>
          <NavItem
            active={true}
            href="/ext"
            style={{ display: "block", width: 120 }}
          >
            HCF - Centre
          </NavItem>
        </Nav.Menu>
      </Nav>
    </Navbar>
  );
};

export default React.memo(NrjrsNav);
