function findTotalDistanceDiv(elem) {
    const xpath = "//*[@id='ruler']/div/div[4]";
    return document
        .evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
        .singleNodeValue;
}

function convertMiToNm(mi) {
    return 0.868976 * mi;
}

const CONVERSION_FACTORS = {
    "mi": 0.868976,
    "ft": 0.000164579,
    "nm": 1.0
};

function computeNm(totalDistanceDiv) {
    for (n in totalDistanceDiv.children) {
        if (totalDistanceDiv.children[n].innerText != null) {
            const matchMi = totalDistanceDiv.children[n].innerText.match(/([0-9.,]*) mi/);
            if (matchMi != null && matchMi.length > 1) {
                return parseFloat(matchMi[1].replaceAll(',', '')) * CONVERSION_FACTORS["mi"];
            }
            const matchFt = totalDistanceDiv.children[n].innerText.match(/([0-9.,]*) ft/);
            if (matchFt != null && matchFt.length > 1) {
                return parseFloat(matchFt[1].replaceAll(',', '')) * CONVERSION_FACTORS["ft"];
            }
        }
    }
    return null;
}

function addOrUpdateAddNmNode(totalDistanceDiv, nm) {
    var nmSpan = document.getElementById("gmnm_nm");
    
    if (nmSpan == null) {
        nmSpan = document.createElement("span");
        nmSpan.id = "gmnm_nm";
        totalDistanceDiv.appendChild(nmSpan);
    }
    
    nmSpan.innerText = ` (${nm.toFixed(1)} nm)`;
}

function updateTotalDistanceDivListener() {
    var totalDistanceDiv = findTotalDistanceDiv();
    if (totalDistanceDiv != null) {
        const nm = computeNm(totalDistanceDiv);
        
        if (nm != null) {
            addOrUpdateAddNmNode(totalDistanceDiv, nm);
        }
    }
}


document
    .getElementsByTagName("canvas")[0]
    .addEventListener("click", updateTotalDistanceDivListener);

console.log("NM in GM will do stuff on this page.");