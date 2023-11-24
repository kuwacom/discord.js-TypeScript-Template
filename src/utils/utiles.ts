
export const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

export const sec2HHMMSS = (secs: number): string => {
    const seconds = parseInt(secs.toString(), 10)
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = Math.floor(seconds % 60);
    
    const hh = h < 10 ? "0" + h : h;
    const mm = m < 10 ? "0" + m : m;
    const ss = s < 10 ? "0" + s : s;
    
    return hh + ":" + mm + ":" + ss;
}

export const time2Sec = (timeString: string): number => {
    if (!timeString) return 0;
    const timeArray = timeString.split(":");
    const seconds = timeArray.reduce((acc, cur: any, index) => {
        return acc + cur * Math.pow(60, timeArray.length - index - 1);
    }, 0);
    return seconds;
}

export const randRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);


export const isURL = (text: string): boolean => {
    if (/^(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(text)) {
        return true;
    } else {
        return false;
    }
}


export const bitParser = (size: number) => {
    const kb = 1024;
    const mb = Math.pow(kb, 2);
    const gb = Math.pow(kb, 3);
    const tb = Math.pow(kb, 4);

    let target = null;
    let unit = "";
    if (size >= tb) {
        target = tb;
        unit = "T";
    } else if (size >= gb) {
        target = gb;
        unit = "G";
    } else if (size >= mb) {
        target = mb;
        unit = "M";
    } else if (size >= kb) {
        target = kb;
        unit = "K";
    }
    const res = target !== null?Math.floor((size / target) * 100) / 100 : size;
    return res + unit;
}