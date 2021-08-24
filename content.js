function findTotalDistanceDiv() {
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
    "m": 0.000539957,
    "km": 0.539957,
    "nm": 1.0
};

function computeNm(totalDistanceDiv) {
    for (n in totalDistanceDiv.children) {
        if (totalDistanceDiv.children[n].innerText != null) {
            const match = totalDistanceDiv.children[n].innerText.match(/([0-9.,]*) (mi|ft|km|m)/);
            if (match != null && match.length > 2) {
                return parseFloat(matchMi[1].replaceAll(',', '')) * CONVERSION_FACTORS[match[2]];
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
    
    var newText = ` (${nm.toFixed(1)} nm)`;
    if (nmSpan.textContent !== newText) {
        nmSpan.textContent = newText;
    }
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

function setupMutationObserver() {
    const totalDistanceDiv = findTotalDistanceDiv();
    if (totalDistanceDiv == null) {
        return;
    }
    const canvas = document.getElementsByTagName("canvas")[0];
    const updateDistanceObserver =
          new MutationObserver((ml, ob) => updateTotalDistanceDivListener);
    updateDistanceObserver.observe(
        totalDistanceDiv.parentElement,
        { attributes: true, childList: true, subtree: true });
}

//document.addEventListener("DOMContentLoaded", (event) => {
    document
        .getElementsByTagName("canvas")[0]
        .addEventListener("click", setupMutationObserver);

    console.log("NM in GM will do stuff on this page.");
//});
