function findTotalDistanceDiv() {
    const xpath = "//*[@id='ruler']/div/div[4]";
    return document
        .evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
        .singleNodeValue;
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
                console.info(`[GMNM] Distance is now ${match[1]} ${match[2]}.`);
                return parseFloat(match[1].replaceAll(',', '')) * CONVERSION_FACTORS[match[2]];
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
        console.info(`[GMNM] Updating to ${newText} because it used to be ${nmSpan.textContent}`);
        nmSpan.textContent = newText;
    }
}

function updateTotalDistanceDivListener() {
    console.log(`[GMNM] Observed something`);
    var totalDistanceDiv = findTotalDistanceDiv();
    if (totalDistanceDiv != null) {
        const nm = computeNm(totalDistanceDiv);
        console.info(`[GMNM] That's ${nm} nm`);
        
        if (nm != null) {
            addOrUpdateAddNmNode(totalDistanceDiv, nm);
        }
    }
}

var updateDistanceObserver = null;

function setupMutationObserver() {
    if (updateDistanceObserver != null) {
        return;
    }
    const totalDistanceDiv = findTotalDistanceDiv();
    if (totalDistanceDiv == null) {
        return;
    }
    updateDistanceObserver =
          new MutationObserver((ml, ob) => updateTotalDistanceDivListener());
    updateDistanceObserver.observe(
        totalDistanceDiv.parentElement,
        { attributes: true, childList: true, subtree: true });
    console.info('[GMNM] NM in GM is Observing.');
}

//window.addEventListener("DOMContentLoaded", (event) => {
    document
        .getElementsByTagName("canvas")[0]
        .addEventListener("click", setupMutationObserver);

    console.info("[GMNM] NM in GM will do stuff on this page.");
//});
