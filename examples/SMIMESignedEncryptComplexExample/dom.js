let destroyClickedElement = function (event) {
    "use strict";
    // noinspection XHTMLIncompatabilitiesJS
    document.body.removeChild(event.target);
};

let subjecttable = function (dn) {
    "use strict";
    let c;
    let tbl = window.document.createElement("table");
    let tr = window.document.createElement("tr");
    let th = window.document.createElement("th");
    let td;
    let tn = window.document.createTextNode("Type");

    th.appendChild(tn);
    tr.appendChild(th);

    th = window.document.createElement("th");
    tn = window.document.createTextNode("Value");

    th.appendChild(tn);
    tr.appendChild(th);
    tbl.appendChild(tr);

    if (dn.length < 1) {
        return null;
    }
    c = 0;
    while (c < dn.length) {
        tr = window.document.createElement("tr");
        td = window.document.createElement("td");
        tn = window.document.createTextNode(dn[c][0]);

        td.appendChild(tn);
        tr.appendChild(td);

        td = window.document.createElement("td");
        tn = window.document.createTextNode(dn[c][1]);

        td.appendChild(tn);
        tr.appendChild(td);

        tbl.appendChild(tr);
        c += 1;
    }
    return tbl;
};

let certtablerow = function (parsedcert, num) {
    "use strict";
    let localtr = window.document.createElement("tr");
    let dn = [];
    let alts = [];
    let j = 0;
    let tn;
    let tdn;

    if (num !== undefined) {
        tdn = window.document.createElement("td");
        tn = window.document.createTextNode(num);

        tdn.appendChild(tn);
        localtr.appendChild(tdn);
    }

    tdn = window.document.createElement("td");
    tn = window.document.createTextNode(parsedcert.serial);
    tdn.appendChild(tn);
    localtr.appendChild(tdn);

    tdn.appendChild(tn);
    localtr.appendChild(tdn);

    j = 0;
    let cdn;
    while (j < 2) {
        tdn = window.document.createElement("td");
        if (j === 0) {
            dn = parsedcert.subject.dn;
        } else {
            dn = parsedcert.issuer.dn;
        }
        cdn = subjecttable(dn);
        tdn.appendChild(cdn);
        localtr.appendChild(tdn);
        j += 1;
    }
    tdn = window.document.createElement("td");
    if (parsedcert.subject.alt_names.length !== 0) {
        alts = parsedcert.subject.alt_names;
        cdn = subjecttable(alts);
        tdn.appendChild(cdn);
    }
    localtr.appendChild(tdn);

    return localtr;
};

let certtable = function (parsedcerts, signers) {
    "use strict";
    let l;
    let thr;
    let th;
    let tn;
    let certtcont =
            window.document.createElement("div");
    let certt =
            window.document.createElement("table");

    /* create header row */
    thr =
            window.document.createElement("tr");
    th =
            window.document.createElement("th");
    tn =
            window.document.createTextNode("#");

    th.appendChild(tn);
    thr.appendChild(th);

    th =
            window.document.createElement("th");
    tn =
            window.document.createTextNode("Serial #");
    th.appendChild(tn);
    thr.appendChild(th);

    th =
            window.document.createElement("th");
    tn =
            window.document.createTextNode("Subject DN");
    th.appendChild(tn);
    thr.appendChild(th);

    th =
            window.document.createElement("th");
    tn =
            window.document.createTextNode("Issuer DN");
    th.appendChild(tn);
    thr.appendChild(th);

    th =
            window.document.createElement("th");
    tn =
            window.document.createTextNode("Subject Alt Name");
    th.appendChild(tn);
    thr.appendChild(th);

    certt.appendChild(thr);
    /* End create header table */

    let c;
    if (signers !== undefined
            && signers.length !== undefined
            && signers.length > 0) {
        let sp =
                window.document.createElement("span");
        let str = "Signers: ";
        str += signers[0];
        c = 1;
        while (c < signers.length) {
            str += ", "
                    + signers[c];
            c += 1;
        }
        tn =
                window.document.createTextNode(str);
        sp.appendChild(tn);
        certtcont.appendChild(sp);
    }
    c = 0;
    l = parsedcerts.length;

    while (c < l) {
        let tr = certtablerow(parsedcerts[c], c);
        certt.appendChild(tr);
        c += 1;
    }
    certtcont.appendChild(certt);

    return certtcont;
};
let dlblob = function (pkcs12AsBlob) {
    "use strict";
    const downloadLink = document.createElement("a");
    downloadLink.download = "pkijs_pkcs12.p12";
    // noinspection InnerHTMLJS
    downloadLink.innerHTML = "Download File";

    downloadLink.href = window.URL.createObjectURL(pkcs12AsBlob);
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    // noinspection XHTMLIncompatabilitiesJS
    document.body.appendChild(downloadLink);

    downloadLink.click();
};
