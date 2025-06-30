
const useNrjAryKeyStrng = (ary: any, strWth: string) => {
    let strF : string = "";
    if (ary) {
        let keys = Object.keys(ary);
        
        let ar = new Array();
        ar = ary;
        console.log(ar);
        for (let i = 0, j = keys.length; i < j; i++) {
            if (keys[i].indexOf(strWth) === 0) {
                let ky : string = keys[i];
                let result = ary[ky]
                if (result){
                    if (strF) {
                        strF += "=";
                    }
                    strF += keys[i].substring(strWth.length) + '][';
                    strF += result;
                }
                
            }
        }
    } 
    return strF;
}

export default useNrjAryKeyStrng