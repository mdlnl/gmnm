function findTotalDistanceDiv() {
    const xpath = "//*[@id='ruler']/div";
    return document
        .evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
        .singleNodeValue;
}

function findTotalDistanceDivByText() {
    var xpath = "//*[text()='Total distance: ']";
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
    if (totalDistanceDiv.innerText != null) {
        // console.info(`[GMNM] Checking ${totalDistanceDiv.children[n].innerText}...`);
        const match = totalDistanceDiv.innerText.match(/([0-9.,]+) (mi|ft|km|m)/);
        if (match != null && match.length > 2) {
            // console.info(`[GMNM] Found distance in "${totalDistanceDiv.innerText}"`);
            // console.info(`[GMNM] Distance is now ${match[1]} ${match[2]}.`);
            return parseFloat(match[1].replaceAll(',', '')) * CONVERSION_FACTORS[match[2]];
        }
    }
}

function computeNmForChildren(parentTotalDistanceDiv) {
    // console.info(`[GMNM] Looking for distance text in ${totalDistanceDiv.innerHTML}`);
    for (n in totalDistanceDiv.children) {
        computeNm(totalDistanceDiv.children[n])
    }
    console.warn(`[GMNM] Couldn't find a child with inner text matching distance pattern`);
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
        // console.info(`[GMNM] Updating to ${newText} because it used to be ${nmSpan.textContent}`);
        nmSpan.textContent = newText;
    }
}

function updateTotalDistanceDivListener(mutationList) {
    // console.info(`[GMNM] Observed something`);
    var totalDistanceDiv = findTotalDistanceDivByText();
    if (totalDistanceDiv != null) {
        const nm = computeNm(totalDistanceDiv);
        console.info(`[GMNM] That's ${nm} nm`);
        
        if (nm != null) {
            addOrUpdateAddNmNode(totalDistanceDiv, nm);
        }
    } else {
        console.warn(`[GMNM] Can't find total distance div`);
    }
}

function startGmnmObservation(element) {
    new MutationObserver((rml, rob) => updateTotalDistanceDivListener(rml))
        .observe(
        element,
        {
            attributes:true, // needed when text changes
            childList:true, // needed for when text is added
            subtree:true // needed, no idea why
        });
    console.info('[GMNM] Observing new ruler.');
    return;
}

var contentContainerNode = document.getElementById("content-container");
if (contentContainerNode != null) {
    new MutationObserver((ml, ob) => {
        for (m in ml) {
            if (ml[m].target.id == 'ruler') {
                startGmnmObservation(ml[m].target);
            }
        }
    }).observe(contentContainerNode, { childList: true, subtree: true });
    console.info('[GMNM] Watching for ruler creation.');
} else {
    console.warn('[GMNM] Element "content-container" not found.');
    startGmnmObservation(document);
}