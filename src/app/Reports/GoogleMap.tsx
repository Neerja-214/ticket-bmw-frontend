// GoogleMap.js
import React, { useEffect, useRef, useState } from 'react';
import { GetResponseWnds, createGetApi, dataStr_ToArray } from '../../utilities/utilities';
import { nrjAxios, useNrjAxios } from '../../Hooks/useNrjAxios';
import { useQuery } from '@tanstack/react-query';
import NrjRsDt from '../../components/reusable/NrjRsDt';
import { useNavigate, useSearchParams } from 'react-router-dom';

function GoogleMap() {
  const mapRef = useRef(null);
  const markerRef = useRef<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [defaultCenter, setDefaultCenter] = useState<any>();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNumber = searchParams.get("pageNumber");
  const gid = searchParams.get("gid");

  useEffect(() => {
    if (!pageNumber) {
      const ltt = searchParams.get("ltt") || '17.364';
      const lgn = searchParams.get("lgn") || '78.82';
      const hcfnm = sessionStorage.getItem('hcfnm') || 'Please Select a Hospital';
      setLocations([
        [
          hcfnm,
          parseFloat(ltt),
          parseFloat(lgn)
        ]
      ]);
    }
    else {
      refetch();
    }
  }, [])

  const GetMapPnts = () => {
    let api : string = createGetApi("db=nodb|dll=accdll|fnct=c290", pageNumber + "=" + gid)
    
    return useNrjAxios({apiCall : api})
  }

  const MyMapPnts = (data: any) => {
    let dt: string = GetResponseWnds(data)
    if (dt) {

      let ary: any = dataStr_ToArray(dt)
      let i: number = 0
      let tempLocation:any[] = [];
      while (i < ary.length) {
        const address = ary[i]['adra'];
        const Noofbeds = ary[i]['nbd']
        if (ary[i]['ltt'] && ary[i]['lgnt']) {

          tempLocation.push([ary[i]['hsp'], Number(ary[i]['ltt']), Number(ary[i]['lgnt']), address, Noofbeds])
        }
        i += 1;
      }
      setLocations(tempLocation);
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

  

  useEffect(()=>{
    if(locations.length){
      initMap();
    }
  },[locations])


  function initMap(){
    let map:any
    if(mapRef.current){
      map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter? defaultCenter : { lat: locations[0][1], lng: locations[0][2] },
        zoom: 12,
      });
    }
    
    let markers = [];
    for (let i = 0; i < locations.length; i++) {  
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(locations[i][1], locations[i][2]),
        title: locations[i][0],
        clickable:true,
        map: map
      });
      markers.push(marker)
      markerRef.current = marker;
    }
      
      markers.map((marker:any)=>{
        // console.log(marker)
        const infowindow = new google.maps.InfoWindow({
          content: marker.title,
          ariaLabel: "Uluru",
        });

        marker.addListener("click", () => {
          infowindow.open({
            anchor: marker,
            map,
          });
        });
      }) 
  }

  return (<>
  <div ref={mapRef} style={{ width: '1100px', height: '500px' }} />;
  </>
  )
}

export default GoogleMap;

