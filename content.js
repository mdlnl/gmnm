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

function updateTotalDistanceDivListener(mutationList) {
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

const contentContainerNode = document.getElementById("content-container");
if (contentContainerNode != null) {
    new MutationObserver((ml, ob) => {
        for (m in ml) {
            if (ml[m].target.id == 'ruler') {
                new MutationObserver((rml, rob) => updateTotalDistanceDivListener(rml))
                    .observe(
                        ml[m].target,
                        {
                            attributes:true, // needed when text changes
                            childList:true, // needed for when text is added
                            subtree:true // needed, no idea why
                        });
                console.info('[GMNM] Observing new ruler.');
                return;
            }
        }
    }).observe(contentContainerNode, { childList: true, subtree: true });
    console.info('[GMNM] Watching for ruler creation.');
}
