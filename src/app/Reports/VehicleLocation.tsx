import React, { useEffect, useRef, useState, useReducer } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { OSM } from 'ol/source';
import { TileWMS, Vector as VectorSource } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { LineString, Point } from 'ol/geom';
import { boundingExtent, createEmpty, extend, isEmpty } from 'ol/extent';
import Feature from 'ol/Feature';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Icon from 'ol/style/Icon';
import Overlay from 'ol/Overlay';
import 'ol/ol.css';
import { useQuery } from '@tanstack/react-query';
import utilities, { GetResponseLnx, GetResponseWnds, postLinux, getCmpId, getUsrnm, trimField } from '../../utilities/utilities';
import { nrjAxiosRequestBio, nrjAxiosRequestLinux } from '../../Hooks/useNrjAxios';
import XYZ from 'ol/source/XYZ';
import { useEffectOnce } from 'react-use';
import { Toaster } from '../../components/reusable/Toaster';
import WtrRsSelect from '../../components/reusable/nw/WtrRsSelect'
import { getFldValue } from "../../Hooks/useGetFldValue";
import { getLvl } from '../../utilities/cpcb'
import { getWho } from '../../utilities/cpcb'
import { Button } from "@mui/material";
import NrjRsDt from 'src/components/reusable/NrjRsDt';
import moment from 'moment';
import { format, set } from 'date-fns'
import { UseMomentDateNmb } from 'src/Hooks/useMomentDtArry';
import { useToaster } from 'src/components/reusable/ToasterContext';
import { validForm } from 'src/Hooks/validForm';
import axios from 'axios';

const ACTIONS = {
  TRIGGER_GRID: "grdtrigger",
  NEWROWDATA: "newrow",
  RANDOM: "rndm",
  TRIGGER_FORM: "trgfrm",
  FORM_DATA: "frmdata",
  SETFORM_DATA: "setfrmdata",
  MAINID: "mnid",
  CHECK_REQ: "chckreq",
  CHECK_REQDONE: "chckreqdn",
  SETGID: "gd",
  NEWFRMDATA: "frmdatanw",
  SETCBWTFCOMBO: "setCbwtfCombo",
  SETSTATECOMBO: "setStateCombo",
  SETRGDCOMBO: "setRgdCombo",
  SETVEHICLECOMBO: 'setVehicleCombo'
};

const initialState = {
  triggerG: 0,
  nwRow: [],
  rndm: 0,
  trigger: 0,
  textDts: "",
  mainId: 0,
  errMsg: [],
  openDrwr: false,
  frmData: "",
  gid: "",
  cbwtfCombo: "",
  stateCombo: "",
  rgdCombo: "",
  vehicleCombo: "",
};

type purBill = {
  triggerG: number;
  nwRow: any;
  rndm: number;
  trigger: number;
  textDts: string;
  mainId: number;
  errMsg: any;
  openDrwr: boolean;
  frmData: string;
  gid: string;
  cbwtfCombo: string;
  stateCombo: string;
  rgdCombo: string;
  vehicleCombo: string;
};

type act = {
  type: string;
  payload: any;
};
interface SttDetails {
  stt: string;
}

// interface for gps data
type GpsPoint = {
  type: string;
  latitude: number;
  longitude: number;
  servertime: string;
};

type TransformedVehicleData = {
  vehicle_no: string;
  color: string;
  truckIcon: string;
  route: GpsPoint[];
};

type RawGpsPoint = {
  ltt: string;
  lgt: string;
  cdt?: string;
  ctm?: string;
};

type VehicleData = {
  vehicle_no: string;
  gps_data: RawGpsPoint[];
};


const reducer = (state: purBill, action: act) => {
  let newstate: any = { ...state };
  switch (action.type) {
    case ACTIONS.NEWFRMDATA:
      newstate.textDts = action.payload;
      return newstate;
    case ACTIONS.MAINID:
      newstate.mainId = action.payload;
      newstate.gid = "";
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.TRIGGER_GRID:
      newstate.triggerG = action.payload;
      return newstate;
    case ACTIONS.TRIGGER_FORM:
      newstate.trigger = action.payload;
      if (action.payload === 0) {
        newstate.textDts = "";
        newstate.frmData = "";
        newstate.mainId = 0;
      }
      return newstate;
    case ACTIONS.NEWROWDATA:
      newstate.nwRow = action.payload;
      newstate.triggerG = 1;
      return newstate;
    case ACTIONS.RANDOM:
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.FORM_DATA:
      let dta: string = "";
      let fldN: any = utilities(2, action.payload, "");
      if (newstate.textDts) {
        dta = newstate.textDts + "=";
        let d: any = utilities(1, dta, fldN);
        if (d) {
          dta = d;
        } else {
          dta = "";
        }
      }
      dta += action.payload;
      newstate.textDts = dta;
      return newstate;

    case ACTIONS.SETFORM_DATA:
      newstate.frmData = action.payload;
      return newstate;
    case ACTIONS.CHECK_REQ:
      newstate.errMsg = action.payload;
      newstate.openDrwr = true;
      return newstate;
    case ACTIONS.CHECK_REQDONE:
      newstate.errMsg = [];
      newstate.openDrwr = false;
      return newstate;
    case ACTIONS.SETSTATECOMBO:
      newstate.stateCombo = action.payload;
      return newstate;
    case ACTIONS.SETCBWTFCOMBO:
      newstate.cbwtfCombo = action.payload;
      return newstate;
    case ACTIONS.SETVEHICLECOMBO:
      newstate.vehicleCombo = action.payload;
      return newstate;
    case ACTIONS.SETRGDCOMBO:
      newstate.rgdCombo = action.payload;
      return newstate;
    case ACTIONS.SETGID:
      newstate.gid = action.payload;
      return newstate;
  }
};


const BhuvanMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View | null>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [sttValue, setSttValue] = useState<string>("");
  const [cbwtfValue, setCbwtfValue] = useState<string>("");
  const [vehicleval, setVehicleVal] = useState<string>("")
  const [fltr, setFltr] = useState("")
  const [rgdValue, setRgdValue] = useState<string>("");
  const [notFoundCbwtfFltr, setNotFoundCbwtfFltr] = useState<boolean>(false)
  const { showToaster, hideToaster } = useToaster();
  const [isLoading, setIsLoading] = useState("");
  const [showMessage, setShowMessage] = useState<any>({ message: [] });

  const [groupedVehicleData, setGroupedVehicleData] = useState<any[]>([]);


  const hideInStt = getLvl() == "STT" ? true : false
  const hideInCpcb = getLvl() == "CPCB" ? true : false
  const hideInRgd = getLvl() == "RGD" ? true : false


const [map_center, setMapCenter] = useState<[number, number]>(() => fromLonLat([77.2090, 28.6139]) as [number, number]);
const [zoomLevel, setZoomLevel] = useState<number>(5);


useEffect(() => {
 
  const INACTIVITY_LIMIT = 2 * 60 * 1000;
  let lastInteractionTime = Date.now();
  let map: Map;
  let refreshTimer: ReturnType<typeof setInterval>;
  let hoverTooltip: Overlay;
  const updateInteractionTime = () => lastInteractionTime = Date.now();

  const initMap = (): Map => {
    const baseLayer = new TileLayer({ source: new OSM() });
    const bhuvanLayer = new TileLayer({
      source: new TileWMS({
        url: 'https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms',
        params: {
          LAYERS: 'India_Boundary',
          FORMAT: 'image/png',
          TRANSPARENT: true,
          VERSION: '1.3.0',
        },
        serverType: 'geoserver',
        crossOrigin: 'anonymous',
      }),
    });

    viewRef.current = new View({
      projection: 'EPSG:3857',
      center: map_center,
      zoom: zoomLevel,
      minZoom: 3,
      maxZoom: 18,
    });

    const newMap = new Map({
      target: mapRef.current as HTMLElement,
      layers: [baseLayer, bhuvanLayer],
      view: viewRef.current,
    });

     // Create a single tooltip element for hover
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'ol-tooltip ol-tooltip-hover';
    tooltipElement.style.visibility = 'hidden';
    hoverTooltip = new Overlay({
      element: tooltipElement,
      offset: [10, 0],
      positioning: 'center-left',
      stopEvent: false,
    });
    newMap.addOverlay(hoverTooltip);

     // Add hover interaction
    newMap.on('pointermove', (evt) => {
     
      updateInteractionTime();
      const feature = newMap.forEachFeatureAtPixel(evt.pixel, (f) => f);
      const tooltip = hoverTooltip.getElement() as HTMLElement;
      
      if (feature && feature.get('name')) {
        const vehicleData = feature.get('vehicleData');
        const coordinates = evt.coordinate;
        console.log('vehicleData:', vehicleData);
        // tooltip.innerHTML = `
        //   <div class="tooltip-header">Vehicle No: ${vehicleData.vehicle_no}</div>
        //   <div class="tooltip-content">
        //     <div>Status: ${feature.get('name')}</div>
        //     <div>Time: ${new Date(vehicleData.timestamp).toLocaleString()}</div>
        //   </div>
        // `;

        tooltip.innerHTML = `
        <div style="
          background-color: white;
          border-radius: 8px;
          padding: 10px 14px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
          color: #007BFF;
          font-family: Arial, sans-serif;
          max-width: 250px;
        ">
          <div style="
            font-weight: bold;
            margin-bottom: 6px;
            color: #0056b3;
          ">
            Vehicle No: ${vehicleData.vehicle_no}
          </div>
          <div style="margin: 2px 0;">Status: ${feature.get('name')}</div>
          <div style="margin: 2px 0;">Time: ${new Date(vehicleData.timestamp).toLocaleString()}</div>
        </div>
      `;

        tooltip.style.visibility = 'visible';
        hoverTooltip.setPosition(coordinates);
      } else {
        tooltip.style.visibility = 'hidden';
      }
    });

    newMap.on('click', updateInteractionTime);
    newMap.on('pointermove', updateInteractionTime);
    newMap.getViewport().addEventListener('wheel', updateInteractionTime);
    return newMap;
  };

  const plotRoutes = () => {
    if (!map || !groupedVehicleData.length) return;

    const layers = map.getLayers().getArray();
    for (let i = layers.length - 1; i >= 0; i--) {
      if (i > 1) map.removeLayer(layers[i]);
    }

    const routeLayer = new VectorLayer({ source: new VectorSource() });
    // const markerLayer = new VectorLayer({ source: new VectorSource() });
     const markerLayer = new VectorLayer({ 
      source: new VectorSource(),
      style: (feature) => {
        return new Style({
          image: new Icon({
            src: feature.get('icon'),
            scale: feature.get('name') === 'Start Point' ? 0.8 : 0.4,
          }),
        });
      }
    });
    map.addLayer(routeLayer);
    map.addLayer(markerLayer);

    const extent = createEmpty();

    groupedVehicleData.forEach((vehicle) => {
      if (!vehicle.route || vehicle.route.length < 2) return;

      (async () => {
        const coordPairs: [number, number][] = vehicle.route.map((p: any) => [p.longitude, p.latitude]);
        const osrmCoords = await fetchRouteFromOSRM(coordPairs);


            if(osrmCoords){
            
              setMapCenter(fromLonLat([osrmCoords[0][0], osrmCoords[0][1]]) as [number, number]);
              setZoomLevel(7);
            } 

        if (!osrmCoords) return;

        const coordinates = osrmCoords.map(coord => fromLonLat(coord));
        const routeFeature = new Feature({ geometry: new LineString(coordinates) });
        routeFeature.setStyle(new Style({
          stroke: new Stroke({ color: vehicle.color, width: 3 }),
        }));

        routeLayer.getSource()?.addFeature(routeFeature);
        extend(extent, routeFeature.getGeometry()!.getExtent());

      
        const startMarker = new Feature({
          geometry: new Point(coordinates[0]),
          name: 'Start Point',
          vehicleData: {
            vehicle_no: vehicle.vehicle_no,
          
            timestamp: vehicle.route[0].servertime, // corrected here
            latitude: vehicle.route[0].latitude,
            longitude: vehicle.route[0].longitude
          },
          icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });

      
        
           // End marker with vehicle data
        const endMarker = new Feature({
          geometry: new Point(coordinates[coordinates.length - 1]),
          name: 'End Point',
          vehicleData: {
            vehicle_no: vehicle.vehicle_no,
            timestamp: vehicle.route[vehicle.route.length - 1].servertime, // corrected here
            latitude: vehicle.route[vehicle.route.length - 1].latitude,
            longitude: vehicle.route[vehicle.route.length - 1].longitude
          },
          icon: vehicle.truckIcon
        });


        markerLayer.getSource()?.addFeatures([startMarker, endMarker]);
      // Create tooltip elements
        const startTooltip = document.createElement('div');
        startTooltip.className = 'ol-tooltip ol-tooltip-measure';
        // startTooltip.textContent = `Start: ${vehicle.vehicle_no}`;
        document.body.appendChild(startTooltip);  // Ensure it's in DOM

        const endTooltip = document.createElement('div');
        endTooltip.className = 'ol-tooltip ol-tooltip-measure';
        // endTooltip.textContent = `End: ${vehicle.vehicle_no}`;
        document.body.appendChild(endTooltip);  // Ensure it's in DOM

        const startOverlay = new Overlay({
          element: startTooltip,
          position: coordinates[0],
          positioning: 'bottom-center',
          stopEvent: false,
          offset: [0, -15],
          insertFirst: true
        });


         const endOverlay = new Overlay({
          element: endTooltip,
          position: coordinates[coordinates.length - 1],
          positioning: 'bottom-center',
          stopEvent: false,
          offset: [0, -15],
          insertFirst: true
        });
        map.addOverlay(startOverlay);
        map.addOverlay(endOverlay);
        startOverlay.setPosition(coordinates[0]);
        endOverlay.setPosition(coordinates[coordinates.length - 1]);
      })();
    });

    if (Date.now() - lastInteractionTime > INACTIVITY_LIMIT && !isEmpty(extent)) {
      viewRef.current?.fit(extent, {
        padding: [60, 60, 60, 60],
        maxZoom: 14,
        duration: 1000,
      });
    }
  };

  if (!mapRef.current) return;

  map = initMap();

  if (groupedVehicleData.length) {
    plotRoutes();
  }

  refreshTimer = setInterval(() => {
    if (Date.now() - lastInteractionTime >= INACTIVITY_LIMIT && mapRef.current) {
      map.setTarget(undefined);
      setTimeout(() => {
        map.setTarget(mapRef.current as HTMLElement);
        if (groupedVehicleData.length) {
          plotRoutes();
        }
      }, 0);
    }
  }, 30 * 1000);

  return () => {
    clearInterval(refreshTimer);
    map.setTarget(undefined);
  };
}, [groupedVehicleData]);



// ========== Transformation Function ==========
const transformGpsData = (apiResponse: VehicleData[]): TransformedVehicleData[] => {
  return apiResponse.map((vehicle, index) => {
    const { vehicle_no, gps_data } = vehicle;
    const total = apiResponse.length;

    if (!gps_data?.length) return null;

    let route: GpsPoint[] = gps_data.map((point): GpsPoint => {
      const latitude = parseFloat(point.ltt);
      const longitude = parseFloat(point.lgt);
      let serverTime = '';

      if (point.cdt && point.ctm) {
        const [day, month, year] = point.cdt.split("-");
        let [time, modifier] = point.ctm.split(" ");
        let [hours, minutes, seconds] = time.split(":").map(Number);

        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        const dateObj = new Date(+year, +month - 1, +day, hours, minutes, seconds);
        if (!isNaN(dateObj.getTime())) serverTime = dateObj.toISOString();
      }

      return { type: "stop", latitude, longitude, servertime: serverTime };
    });

    // Sort & clean
    route = route
      .sort((a, b) => new Date(a.servertime).getTime() - new Date(b.servertime).getTime())
      .filter((point, i, arr) => {
        const prev = arr[i - 1];
        const next = arr[i + 1];
        return !(prev && next &&
          point.latitude === prev.latitude && point.longitude === prev.longitude &&
          point.latitude === next.latitude && point.longitude === next.longitude);
      });

    if (route.length === 1) {
      route[0].type = "Start Point";
    } else if (route.length >= 2) {
      const start = route[0];
      const end = route[route.length - 1];

      if (start.latitude === end.latitude && start.longitude === end.longitude) {
        start.type = "Start Point";
        route = route.slice(0, -1);
        for (let i = 1; i < route.length; i++) route[i].type = "Waypoint";
      } else {
        start.type = "Start Point";
        end.type = "End Point";
        for (let i = 1; i < route.length - 1; i++) route[i].type = "Waypoint";
      }
    }

    return {
      vehicle_no,
      color: generateUniqueColor(index, total),
      truckIcon: "https://img.icons8.com/?size=70&id=etRqsBHtSyMZ&format=png&color=000000",
      route
    };
  }).filter((item): item is TransformedVehicleData => item !== null);
};

// generateUniqueColor
const generateUniqueColor = (index: number, total: number): string => {
  const hue = (index * (360 / total)) % 360;
  return `hsl(${hue}, 100%, 50%)`;
};
// fetchRouteFromOSRM
const fetchRouteFromOSRM = async (coordPairs: [number, number][]) => {
  const coords = coordPairs.map(([lon, lat]) => `${lon},${lat}`).join(';');
  const apiUrl = `https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.routes?.length || !data.routes[0].geometry?.coordinates) {
      throw new Error("No route found");
    }

    return data.routes[0].geometry.coordinates as [number, number][];
  } catch (error) {
    console.error("OSRM fetch error:", error);
    return coordPairs; // fallback to original points if OSRM fails
  }
};



// plot route end

  const getDataStateForRgd = (Stt: any) => {
    let payload: any = {};
    if (Stt) {
      payload = postLinux(Stt, "sttrgd");
    } else {
      payload['cmpid'] = getCmpId() || "";
      payload['usrnm'] = getUsrnm() || "";

    }
    return nrjAxiosRequestBio('sttrgd', payload)

  };

  const getSttlistForRgd = async () => {
    let stt = getWho()
    if (stt) {
      try {
        let result = await getDataStateForRgd(stt)
        sttCombo(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }

    }


  }


  useEffect(() => {
    let lvl = sessionStorage.getItem('lvl')
    if (lvl == 'RGD') {
      getSttlistForRgd()
    }
  }, [])

  // const getCbwtf = (stateData: string, filter: string) => {
  //     let payload: any = postLinux(getLvl() + '=' + getWho() + '=' + filter, 'cbwtflistDrp')
  //     if (stateData) {
  //         payload = postLinux('STT=' + stateData.split("|")[0] + '=' + filter, 'cbwtflistDrp');
  //         setNotFoundCbwtfFltr(true);
  //         return nrjAxiosRequestBio('cbwtfnmlist', payload)
  //     }
  // };

  const getCbwtf = (stateData: string, filter: string) => {
    let who = sessionStorage.getItem('who')
    let lvl = sessionStorage.getItem('lvl')
    if (lvl == 'STT') {
      let sttDetails = sessionStorage.getItem('sttDetails')
      if (sttDetails) {
        const parsedSttDetails = JSON.parse(sttDetails) as SttDetails; // Parse and assert type
        who = parsedSttDetails.stt; // Access the stt property
      }

    }

    //let api: string = getApiFromBiowaste("cbwtfregtdy");
    let payload: any = postLinux(lvl + '=' + who + '=' + filter, 'cbwtflistDrp')
    if (stateData) {
      payload = postLinux('STT=' + stateData.split("|")[0] + '=' + filter, 'cbwtflistDrp');
    }
    setNotFoundCbwtfFltr(true);
    return nrjAxiosRequestBio('cbwtfnmlist', payload)
  };

  const getCbwtfSuccess = (datacbwtf: any) => {
    if (datacbwtf && datacbwtf.status == 200 && datacbwtf.data) {
      let i: number = 0;
      let strCmbo: string = "";
      if (datacbwtf.data && Array.isArray(datacbwtf.data) && datacbwtf.data.length) {
        datacbwtf.data = trimField(datacbwtf.data, "cbwtfnm")
        const sortedData = datacbwtf.data.sort((a: any, b: any) => a.cbwtfnm.localeCompare(b.cbwtfnm));
        while (i < sortedData.length) {
          if (strCmbo) {
            strCmbo += "$^";
          }
          strCmbo += "id][" + datacbwtf.data[i]["cbwtfid"] + "=";
          strCmbo += "txt][" + datacbwtf.data[i]["txt"];
          i += 1;
        }
        dispatch({ type: ACTIONS.SETCBWTFCOMBO, payload: strCmbo });
        setNotFoundCbwtfFltr(false);
        return;
      }
      else {
        dispatch({ type: ACTIONS.SETCBWTFCOMBO, payload: "" });
        setNotFoundCbwtfFltr(true);
      }
    }
  };

  const { data: datacbwtf, refetch: refetchcbwtf } = useQuery({
    queryKey: ["cbwtfcombobox", sttValue, fltr],
    queryFn: () => getCbwtf(sttValue, fltr),
    enabled: true,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: getCbwtfSuccess,
  });

  // const getCbwtfPointSuccess = (datacbwtfpoint: any) => {
  //     if (datacbwtfpoint && datacbwtfpoint.data.ltt && datacbwtfpoint.data.lgt) {
  //         setCbwtfCoordinates({ longitude: datacbwtfpoint.data.lgt, latitude: datacbwtfpoint.data.ltt });
  //     }
  // }

  // const { data: datacbwtfpoint, refetch: refetchcbwtfpoint } = useQuery({
  //     queryKey: ["cbwtfpoint", cbwtfValue],
  //     queryFn: () => getCbwtfPoint(cbwtfValue),
  //     enabled: true,
  //     staleTime: 0,
  //     refetchOnWindowFocus: false,
  //     refetchOnReconnect: false,
  //     onSuccess: getCbwtfPointSuccess,
  // });



  const onChangeRgd = (data: string) => {
    // rgdid
    let fldN: any = utilities(2, data, "");
    if (fldN == 'rgdid') {
      setRgdValue(getFldValue(data, 'rgdid').split('|')[0])
    }
    if (fldN == 'sttid') {
      setSttValue(getFldValue(data, 'sttid').split('|')[0])
    }
    // Reset groupedVehicleData to empty array
    setGroupedVehicleData([]);
    setCbwtfValue("");
    setVehicleVal("");
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  const onChangeCbwtf = (data: string) => {
    setCbwtfValue(getFldValue(data, 'cbwtfid').split('|')[0])
       // Reset groupedVehicleData to empty array
    setGroupedVehicleData([]);
    setVehicleVal("");
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  const onChangeVehicle = (data: string) => {
    setVehicleVal(getFldValue(data, 'vehicle').split('|')[0]);
       // Reset groupedVehicleData to empty array
    setGroupedVehicleData([]);
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  }

  const onSearchDb = (fldnm: string, fltr: string) => {
    setFltr(fltr)
    setNotFoundCbwtfFltr(false);
  }

  const GetDataRgd = () => {
    let payload: any = {};
    return nrjAxiosRequestBio('rgdlst', payload);
  };

  const rgdCombo = (datastt: any) => {
    if (datastt && datastt.status == 200 && datastt.data) {
      let i: number = 0;
      let strCmbo: string = "";
      let dt: any = GetResponseLnx(datastt);
      let ary: any = dt.data;
      while (Array.isArray(ary) && i < ary.length) {
        if (strCmbo) {
          strCmbo += "$^";
        }
        strCmbo += "id][" + ary[i]["drpdwn"] + "=";
        strCmbo += "txt][" + ary[i]["drpdwn"];
        i += 1;
      }
      dispatch({ type: ACTIONS.SETRGDCOMBO, payload: strCmbo });
      return;
    }
  };

  const sttCombo = (datastt: any) => {
    if (datastt && datastt.status === 200 && datastt.data) {
      let i: number = 0;
      let sttCombo: string = "";
      let dt: string = GetResponseWnds(datastt);
      let ary: any = datastt.data.data;
      let uniqueAry: { [key: string]: any } = {};

      ary.forEach((element: any) => {
        uniqueAry[element.fltr] = element;
      });

      for (let key in uniqueAry) {
        if (sttCombo) {
          sttCombo += "$^";
        }
        sttCombo += "id][" + key + "=";
        sttCombo += "txt][" + uniqueAry[key]["drpdwn"];
      }

      while (i < Object.keys(uniqueAry).length) {
        i += 1;
      }

      dispatch({ type: ACTIONS.SETSTATECOMBO, payload: sttCombo });
      return;
    }
  };




  const getDataState = () => {

    let lvl = sessionStorage.getItem('lvl')
    if (lvl !== 'RGD') {
      let payload: any = {};
      if (rgdValue) {
        payload = postLinux(rgdValue, "sttrgd");
      } else {
        payload['cmpid'] = getCmpId() || "";
        payload['usrnm'] = getUsrnm() || "";

      }
      return nrjAxiosRequestBio('sttrgd', payload)

    }


  };

  const getVehicleList = (cbwtfValue: string,) => {
    let usrnm = getUsrnm();
    let cmpid = getCmpId();
    let who = '';
    let lvl = 'CBWTF';
    let vechileNo = ''
    if (cbwtfValue) {
      who = cbwtfValue
      let payload: any = postLinux(who + "=" + vechileNo, 'show_vehicle_list')
      return nrjAxiosRequestLinux("vhclnmlist ", payload);
    }
  }

  const getCbwtfPoint = (cbwtfValue: string) => {
    // let usrnm = getUsrnm();
    // let cmpid = getCmpId();
    // let who = cbwtfValue ? cbwtfValue : '';
    // let lvl = 'CBWTF';
    let cbwtfid = ''
    if (cbwtfValue) {
      cbwtfid = cbwtfValue
      // let payload: any = postLinux(lvl + '=' + who + "=" + usrnm + '=' + cmpid + '=' + cbwtfid, 'show_cbwtf_currentpoint')
      let payload: any = postLinux(cbwtfid, 'show_cbwtf_currentpoint')
      return nrjAxiosRequestLinux("cbwtffctloc ", payload);
    }
  }

  const getVehiclePoint = () => {
    let dateFrm = getFldValue(state.textDts, "dt_frm")
    if (!dateFrm) {
      dateFrm = moment(Date.now()).format("DD-MMM-yyyy")

    }
    let dtFrm = UseMomentDateNmb(dateFrm);
    let usrnm = getUsrnm();
    let cmpid = getCmpId();
    let who = cbwtfValue ? cbwtfValue : '';
    let lvl = 'CBWTF';
    let vechileNo = ''

    vechileNo = vehicleval
    let payload: any = postLinux(lvl + '=' + who + "=" + usrnm + '=' + dtFrm + '=' + vechileNo, 'show_vehicle_currentpoint')
    // return nrjAxiosRequestLinux("show_vhclgps_currentPoint ", payload);
    if (cbwtfValue) {
      return nrjAxiosRequestLinux("show_vhclgps_ofdate ", payload);
    }


  }

  const { data: data2, refetch: refetchState } = useQuery({
    queryKey: ["stateGet", rgdValue],
    queryFn: getDataState,
    enabled: true,
    retry: false,
    staleTime: 200,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: sttCombo
  });

  const getVehicleSuccess = (datavehcileList: any) => {
    if (datavehcileList && datavehcileList.status == 200 && datavehcileList.data) {
      let i: number = 0;
      let vclCmbo: string = "";
      if (datavehcileList.data && Array.isArray(datavehcileList.data) && datavehcileList.data.length) {
        while (i < datavehcileList.data.length) {
          if (vclCmbo) {
            vclCmbo += "$^";
          }
          vclCmbo += "id][" + datavehcileList.data[i]["vhclid"] + "=";
          vclCmbo += "txt][" + datavehcileList.data[i]["vehicleno"];
          i += 1;
        }
        dispatch({ type: ACTIONS.SETVEHICLECOMBO, payload: vclCmbo });
        // setNotFoundCbwtfFltr(false);
        return;
      }
      else {
        dispatch({ type: ACTIONS.SETVEHICLECOMBO, payload: "" });
        setNotFoundCbwtfFltr(true);
      }
    }
  }

  const { data: datavehcileList, refetch: refetchvehicleList } = useQuery({
    queryKey: ["vehicleList", cbwtfValue],
    queryFn: () => getVehicleList(cbwtfValue),
    enabled: !!cbwtfValue,
    retry: false,
    staleTime: 200,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: getVehicleSuccess
  });

  const groupGpsDataByVehicle = (gpsData: any[]) => {
    return gpsData.reduce((acc, entry) => {
      if (!acc[entry.vehicleno]) acc[entry.vehicleno] = [];
      acc[entry.vehicleno].push(entry);
      return acc;
    }, {} as Record<string, any[]>);
  };

  // Fetch API data and process it
  const getVehicleSuccessPoint = (datavehcilePoint: any) => {


    if (!Array.isArray(datavehcilePoint.data) || datavehcilePoint.data.length === 0) {

      return;
    }

    const allGpsData = datavehcilePoint.data
      .map((item: any) => item.gps_data)
      .filter(Boolean)
      .flat();

    if (allGpsData.length === 0) {
      console.warn("No GPS data found");
      return;
    }

    // setGroupedVehicleData(datavehcilePoint.data);

  // Call transformGpsData with the vehicle data

  const transformedData = transformGpsData(datavehcilePoint.data);
  // Use the transformed data as needed
  setGroupedVehicleData(transformedData); // Assuming this is a state setter



  };





  const { data: datavehcilePoint, refetch: refetchvehiclePoint } = useQuery({
    queryKey: ["vehiclePoint"],
    queryFn: getVehiclePoint,
    enabled: !!cbwtfValue,
    retry: false,
    staleTime: 200,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 300000, // 5 minutes
    onSuccess: getVehicleSuccessPoint

  });


  const { data: datac, refetch: fetchRgd } = useQuery({
    queryKey: ["GetDataRgd"],
    queryFn: GetDataRgd,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: rgdCombo,
  });

  useEffectOnce(() => {
    fetchRgd();
  })

  const reqsFldsCbwtf = [
    { fld: 'cbwtfid', msg: "Please Select CBWTF", chck: '1[length]' },]


  const getLoaction = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqsFldsCbwtf);
    if (msg && msg[0]) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
      }, 5000);
      return;
    }
    if (cbwtfValue) {
      refetchvehiclePoint()
    }

  }



  function renderRgdSelect() {
    return (
      <>
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
      </>
    )
  }

  function renderStateSelect() {
    return (
      <WtrRsSelect
        Label="State/UT"
        fldName="sttid"
        idText="txtsttid"
        onChange={onChangeRgd}
        selectedValue={state.frmData}
        clrFnct={state.trigger}
        loadOnDemand={state.stateCombo}
        allwZero={"0"}
        fnctCall={true}
        dbCon={"1"}
        typr={"1"}
        dllName={""}
        fnctName={""}
        parms={'0'}
        allwSrch={true}
        speaker={"Select SPCB/PCC"}
        delayClose={1000}
        placement="bottom"
        displayFormat="1"
      ></WtrRsSelect>
    )
  }

  function renderCbwtffSelect() {
    return (

      <WtrRsSelect
        Label={'CBWTF'}
        displayFormat="1"
        fldName="cbwtfid"
        idText="txtcbwtfid"
        onChange={onChangeCbwtf}
        selectedValue={state.frmData}
        clrFnct={state.trigger}
        allwZero={"0"}
        fnctCall={false}
        dbCon={""}
        typr={""}
        loadOnDemand={state.cbwtfCombo}
        dllName={""}
        fnctName={""}
        parms={""}
        forceDbSearch={true}
        allwSrch={true}
        speaker={"Select CBWTF"}
        onSearchDb={onSearchDb}
        menuStyle={{ maxWidth: '400px', minWidth: '200px' }}
      ></WtrRsSelect>

    )
  }

  function renderVehicleSelect() {
    return (
      <WtrRsSelect
        Label={'Vehicle'}
        displayFormat="1"
        fldName="vehicleid"
        idText="txtvehicleid"
        onChange={onChangeVehicle}
        
        clrFnct={state.trigger}
        allwZero={"0"}
        fnctCall={false}
        dbCon={""}
        typr={""}
        key={state.vehicleCombo || "empty"}
        selectedValue={state.frmData}
        loadOnDemand={state.vehicleCombo}
        dllName={""}
        fnctName={""}
        parms={""}
        forceDbSearch={true}
        allwSrch={true}
        // speaker={"Select Vehicle"}
         speaker={""}
        onSearchDb={onSearchDb}
        menuStyle={{ maxWidth: '400px', minWidth: '200px' }}
      ></WtrRsSelect>

    )
  }

  const GetDataValue = (data: string, fld: string) => {
    let vl: string = getFldValue(data, fld);
    return vl;
  };

  const onChangeDate = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    let fldN: any = utilities(2, data, "");
    let dt = GetDataValue(data, fldN);
    console.log(dt)
       // Reset groupedVehicleData to empty array
    setGroupedVehicleData([]);
    //    setInputData({ ...inputData, date: data, dateValue: dt });
  }
  function renderDatePicker() {
    return (
      <NrjRsDt
        format="dd-MMM-yyyy"
        fldName="dt_frm"
        displayFormat="1"
        idText="txtdt_frm"
        size="lg"
        Label="Date"
        // selectedValue={inputData.date}
        onChange={onChangeDate}
        speaker={"Select"}
      />
    )
  }


  function getButtonLocation() {
    return (
      <div className="mt-4 flex px-2 items-center">

        <div className="mr-2">
          <Button
            size="medium"
            style={{ backgroundColor: "#3490dc", color: '#fff', textTransform: "none", }}
            variant="contained"
            color="success"
            onClick={getLoaction}
            className="me-3"
          >
            Get list
          </Button>
        </div>

      </div>
    )
  }




  return (

    // <div ref={mapRef} style={{ width: '100%', height: '500px' }} />
    <>
      <div className=" font-semibold text-lg text-center ">{isLoading}</div>
      {showMessage && showMessage.message.length != 0 ? (
        <div className="py-2">
          <Toaster data={showMessage} className={""}></Toaster>
        </div>
      ) : (
        <></>
      )}
      <div className=" mt-4 grid grid-cols-3 gap-x-8 gap-y-4 my-4 pt-4">
        {hideInCpcb && renderRgdSelect()}
        {(hideInCpcb || hideInRgd) && renderStateSelect()}
        {(hideInCpcb || hideInStt || hideInRgd) && renderCbwtffSelect()}
        {(hideInCpcb || hideInStt || hideInRgd) && renderVehicleSelect()}
        {renderDatePicker()}
        {getButtonLocation()}
      </div>
      <div className="bg-white p-3" >
        <div ref={mapRef} style={{ width: '100%', height: '500px' }} />
      </div>
    </>


  );
};

export default BhuvanMap;

