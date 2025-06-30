import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import Overlay from 'ol/Overlay';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { GetResponseWnds, createGetApi, dataStr_ToArray } from '../../utilities/utilities';
import { useNrjAxios } from '../../Hooks/useNrjAxios';
import XYZ from 'ol/source/XYZ';
import HdrDrp from '../HdrDrp';
import Typography from '@mui/material/Typography';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import ReactDOM from 'react-dom';
import { useEffectOnce } from 'react-use';
import { clrNAValue } from '../../utilities/cpcb';
import { Toaster } from '../../components/reusable/Toaster';
import { useToaster } from '../../components/reusable/ToasterContext';


function BhuvanMap() {

  const [map, setMap] = useState<any>()
  const [featuresLayer, setFeaturesLayer] = useState<any>()
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const mapElement = useRef<any>();
  const [arr, setArr] = useState<any[]>([]);
  const [navigationString, setNavigationString] = useState("")
  const pageNumber = searchParams.get("pageNumber");

  const gid = searchParams.get("gid");

  useEffectOnce(() => {
    document.title = "Map of the HCF"
    // create and add vector source layer
    const initalFeaturesLayer = new VectorLayer({
      source: new VectorSource()
    })

    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new TileLayer({
          source: new XYZ({
            url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
          })
        }),
        initalFeaturesLayer
      ],
      view: new View({
        projection: 'EPSG:4326',
        center: [78.82, 17.364],
        zoom: 10
      }),
      controls: []
    })
    initialMap.on('loadstart', function () {
      initialMap.getTargetElement().classList.add('spinner');
    });
    initialMap.on('loadend', function () {
      initialMap.getTargetElement().classList.remove('spinner');
    });
    setMap(initialMap)
    setFeaturesLayer(initalFeaturesLayer)
    return () => initialMap.setTarget(undefined)

  })

  let ltt: string;
  let lgn: string;
  let hcfnm: string;

  useEffect(() => {

    if (!pageNumber) {
      ltt = searchParams.get("ltt") || '17.364';
      lgn = searchParams.get("lgn") || '78.82';
      hcfnm = sessionStorage.getItem('hcfnm') || 'Please Select a Hospital';
      setArr([
        {
          lgn: parseFloat(lgn),
          ltt: parseFloat(ltt),
          hcfnm: hcfnm
        }
      ]);
      setNavigationString(`/map?ltt=${ltt}${'&'}lgn=${lgn}`)
    }
    else {
      setIsLoading("Loading data...")
      refetch();
    }
  }, [])

  const GetMapPnts = () => {

    let api: string = createGetApi("db=nodb|dll=accdll|fnct=c290", pageNumber + "=" + gid)

    return useNrjAxios({ apiCall: api })
  }
  const { showToaster, hideToaster } = useToaster();
  const MyMapPnts = (data: any) => {
    let dt: string = GetResponseWnds(data)
    setIsLoading("")
    if (dt) {
      setNavigationString(`/map?pagenumber=${pageNumber}${'&'}gid=${gid}`)
      let ary: any = dataStr_ToArray(dt)
      let arr: any = []
      let i: number = 0
      let hcf: any = []
      console.log(ary.length)
      while (i < ary.length) {
        console.log(isNaN(ary[i]['ltt']));
        if (ary[i]['ltt'] && ary[i]['lgnt'] && !isNaN(Number(ary[i]['ltt'])) && !isNaN(Number(ary[i]['lgnt']))) {
          arr.push([Number(ary[i]['lgnt']), Number(ary[i]['ltt'])])
          let g: string = ary[i]['hcfnm']
          hcf.push(i)
        }
        i += 1;
      }

      let initialMap = map
      initialMap.removeOverlay();
      ary = clrNAValue(ary, 1)
      for (i = 0; i < arr.length - 1; i++) {

        const name = ary[i]['hcfnm'];
        const address = ary[i]['addra'];
        const addressb = ary[i]['addrb'];
        const addressc = ary[i]['addrc'];

        if (Number(ary[i]['nobd']) < 0) {
          ary[i]['nobd'] = 0
        }
        const Noofbeds = ary[i]['nobd']
        const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
          <Tooltip {...props} classes={{ popper: className }} />
        ))(({ theme }) => ({
          [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: '#f5f5f9',
            color: 'rgba(0, 0, 0, 0.87)',
            maxWidth: 220,
            fontSize: theme.typography.pxToRem(12),
            border: '1px solid #dadde9',
          },
        }));

        const tooltip = (
          <HtmlTooltip
            title={
              <React.Fragment>
                <Typography color="inherit">Name: {name}</Typography>
                <em>Address:{address}</em><br /><em>{addressb}</em><br /><em>{addressc}</em><br /><b>Number of beds: {Noofbeds}</b>
              </React.Fragment>
            }
          >
            <div className="font-semibold">
              {/* "https://cdn.mapmarker.io/api/v1/fa/stack?size=50&color=DC4C3F&icon=fa-microchip&hoffset=1" */}
              <img src="https://mapmarker.io/api/v2/font-awesome/v5/pin?text=H&size=25&color=FFF&background=DC4C3F&hoffset=0&voffset=0" />
            </div>
          </HtmlTooltip>
        );

        var element = document.createElement('div');
        ReactDOM.render(tooltip, element);
        // element.innerHTML = `<Tooltip title=${hsp} arrow><div className="font-semibold"><img src="https://cdn.mapmarker.io/api/v1/fa/stack?size=50&color=DC4C3F&icon=fa-microchip&hoffset=1" /></Tooltip></div>`;
        var marker = new Overlay({
          position: [arr[i][0], arr[i][1]],
          positioning: 'center-center',
          element: element,
          stopEvent: false
        });

        initialMap.addOverlay(marker);

      }
      if (arr && Array.isArray(arr) && arr[0] && arr[0][0] && arr[0][1]) {
        initialMap.getView().setCenter([arr[0][0], arr[0][1]]);
      }
      else {
        showToaster(['No data received'], 'error');

      }
      setMap(initialMap)
      // return () => initialMap.setTarget(undefined)
    }
    else {
      showToaster(['No data received'], 'error');
    }
  }

  const { data, refetch } = useQuery({
    queryKey: ["getHCFMap",],
    queryFn: GetMapPnts,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: MyMapPnts,
  });

  useEffect(() => {
    if (arr && arr.length && map) {
      let initialMap = map
      initialMap.removeOverlay();
      for (let i = 0; i < arr.length; i++) {

        const name = arr[i].hcfnm;
        const address = sessionStorage.getItem('pltadra');;
        const Noofbeds = sessionStorage.getItem('pltnbd');
        const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
          <Tooltip {...props} classes={{ popper: className }} />
        ))(({ theme }) => ({
          [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: '#f5f5f9',
            color: 'rgba(0, 0, 0, 0.87)',
            maxWidth: 220,
            fontSize: theme.typography.pxToRem(12),
            border: '1px solid #dadde9',
          },
        }));

        const tooltip = (
          <HtmlTooltip
            title={
              <React.Fragment>
                <Typography color="inherit">Name: {name}</Typography>
                <em>Address:{address}</em><br /><b>Number of beds: {Noofbeds}</b>
              </React.Fragment>
            }
          >
            <div className="font-semibold">
              <img src="https://cdn.mapmarker.io/api/v1/fa/stack?size=50&color=DC4C3F&icon=fa-microchip&hoffset=1" />
            </div>
          </HtmlTooltip>
        );

        var element = document.createElement('div');
        ReactDOM.render(tooltip, element);



        // var element = document.createElement('div');
        // element.innerHTML = `<Tooltip title=${arr[i].hcfnm} arrow><div className="font-semibold"><img src="https://cdn.mapmarker.io/api/v1/fa/stack?size=50&color=DC4C3F&icon=fa-microchip&hoffset=1" /></Tooltip></div>`;
        var marker = new Overlay({
          position: [arr[i].lgn, arr[i].ltt],
          positioning: 'center-center',
          element: element,
          stopEvent: false
        });

        initialMap.addOverlay(marker);

      }
      initialMap.getView().setCenter([arr[0].lgn, arr[0].ltt]);
      setMap(initialMap)
    }
  }, [arr, map])

  const [isLoading, setIsLoading] = useState("");
  const [showMessage, setShowMessage] = useState<any>({ message: [] });



  function navigateToGoogleMap() {
    if (!pageNumber) {
      navigate(navigationString);
    }
  }

  return (
    <>
     <div className=" font-semibold text-lg text-center ">{isLoading}</div>
      {showMessage && showMessage.message.length != 0 ? (
        <div className="py-2">
          <Toaster data={showMessage} className={""}></Toaster>
        </div>
      ) : (
        <></>
      )}
      <div className="bg-white p-3" style={{ minHeight: '100vh' }}>
        {/* <div>
          <HdrDrp hideHeader={false}></HdrDrp>
        </div>
        <span className="text-center text-bold text-blue-600/75 my-4 mb-8">
          <h5>HCF List of CBWTF</h5>
        </span> */}
        {/* <div className='my-1 flex justify-end'>
          <Button
            size="medium"
            style={{ backgroundColor: "#3B71CA" }}
            variant="contained"
            color="success"
            onClick={navigateToGoogleMap}
          >
            Open in google map
          </Button>

        </div> */}
        {/* <WtrRsSelect
          Label="Regional Directorate"
          fldName="rgdid"
          idText="txtrgdid"
          onChange={onChangeRgd}
          selectedValue={state.frmData}
          clrFnct={state.trigger}
          loadOnDemand={state.rgdCombo}
          allwZero={"0"}
          fnctCall={false}
          dbCon={"1"}
          typr={"1"}
          dllName={""}
          fnctName={""}
          parms={'0'}
          allwSrch={true}
          speaker={"Select Regional Directorate"}
          delayClose={1000}
          placement="bottom"
          displayFormat="1"
        ></WtrRsSelect> */}
        <div ref={mapElement} style={{ width: '1050px', height: '80vh', margin: 'auto', paddingBottom: '20px', marginTop: '25px' }}></div>
      </div>
    </>
  )
}

export default BhuvanMap;