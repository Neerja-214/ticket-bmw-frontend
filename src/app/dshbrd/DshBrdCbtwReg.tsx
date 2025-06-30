import React from "react";
import NrjMatTbl from "../../components/reusable/NrjMatTbl";
import Chart from "react-google-charts";
type cbwtf = {
  cbwtf: string;
  bdhcf: string;
  nonbdd: string;
  fields : [],
  chrtData : [],
  headerString : [],
  tblData: []
};

const optns = {
  title: "HCF Breakup",
  is3D : false
}
const DshBrdCbtwReg = (prop: cbwtf) => {
  return (
    <>
      <div className="card mb-3">
        <div className="card-header text-center pta-3">
          <div className="row">
            <div className="col-md-10 stretch-card">
              <div className="card bg-gradient-dark card-img-holder text-white">
                <h5 className="font-weight-bold mb-3">{prop.cbwtf}</h5>
              </div>
            </div>
            <div className="col-md-2 stretch-card">
              <div className="card bg-gradient-dark card-img-holder text-white">
                <h5 className="font-weight-bold mb-3">{prop.nonbdd}</h5>
              </div>
            </div>

            {/* <div className="row">
              <div className="col-md-3">
                <div className="row">
                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        BH
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        CL
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        DS
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        HO
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="row">
                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        MH
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        SI
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        UN
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        VH
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="row">
                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        YG
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        AH
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        BB
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        DH
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="row">
                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        NH
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        PC
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        HC
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-gradient-dark card-img-holder text-white">
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#7B68EE" }}
                      >
                        FA
                      </h6>
                      <h6
                        className="font-weight-normal"
                        style={{ backgroundColor: "#483D8B" }}
                      >
                        {prop.bdhcf}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
            <div className="row">
              <div className="col-md-5">
                <NrjMatTbl showHeader={false} data={prop.tblData} fields={prop.fields} headerString={prop.headerString}
                ></NrjMatTbl>
              </div>
              <div className="col-md-6">
                  <Chart
                    chartType="PieChart"
                    width={'100%'}
                    height={'300px'}
                    options={optns}
                    data={prop.chrtData}
                  ></Chart>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(DshBrdCbtwReg);
