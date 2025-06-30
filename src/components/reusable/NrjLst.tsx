import { useEffect, useState } from "react"

type List = {
    purList : any,
    typ : string,
    colDef : [{width : number,
    fontsize : number, color : string, field : string}]
}
const NrjLst = (props: List) => {
   const [colStyle , setColStyle] = useState([]);
    let ary : any;
   const MakeStyle = () =>{
    let sty : any[] =[];
    let s : string ;
    s = "";
    for (let i =0, j = props.colDef.length; i <j;i++)
    {
        let w : any = props.colDef[i].width ? props.colDef[i].width : 100;
        let f : any =props.colDef[i].fontsize ? props.colDef[i].fontsize : 14;
        s = "width:" + w + " , fontSize : " + f  +", color : " + props.colDef[i].color ? props.colDef[i].color : "black";
        sty.push(s);

    }
    return sty;
    
    
   }
   useEffect(()=>{
    ary = MakeStyle()
    
   },[props.colDef])
  return (
    <>
    {
                    props.purList.map((pur:any) => {
                        
                        return <div style={{fontSize:20}} key={pur.id}>
                            {/* for (let i = 0 , j = ary.lenght; i < j ;i++){

                            } */}
                            
                        </div>
                            
                        
                    })
                }
    </>
  )
}

export default NrjLst