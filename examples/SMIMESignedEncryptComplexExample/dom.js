let destroyClickedElement = function (event)
{
	// noinspection XHTMLIncompatabilitiesJS
	document.body.removeChild(event.target);
}

let certtablerow = function (parsedcert, num)
{
	let localtr = window.document.createElement('tr');
	let dnstr = '';
	let dn = new Array;
	let alts = new Array;
	let altstr = '';
	let c = 0;
	let j = 0;
	let tdn;
	let tn;
	let ul;
	let li;
	
	if (num !== undefined) {
	    tdn= window.document.createElement('td');
	    tn= window.document.createTextNode(num);

	    tdn.appendChild (tn);
	    localtr.appendChild (tdn);
	}
	
	tdn = window.document.createElement('td');
	tn = window.document.createTextNode(parsedcert.serial);
	tdn.appendChild (tn);
	localtr.appendChild (tdn);

	tdn.appendChild (tn);
	localtr.appendChild (tdn);

	j = 0;
	while (j < 2) {
	    c = 0;
	    if (j == 0)
	        dn = parsedcert.subject.dn;
	    else
	        dn = parsedcert.issuer.dn;
	    let l = dn.length;
	    if (l > 0) {
	        dnstr = '/';
	        dnstr += dn[0][0]
	            + '='
	            + dn[0][1]
	        ;
	    }
	    c = 1;
	    while (c < l) {
	        if (dn[c][0] == dn[c-1][0])
	            dnstr += ',';
	        else
	            dnstr += '/';
	        dnstr += dn[c][0]
	            + '='
	            + dn[c][1]
	        ;
	        c++;
	    }
	    tdn =
	        window.document.createElement('td');
	    tn = window.document.createTextNode(dnstr);
	    tdn.appendChild (tn);
	    localtr.appendChild (tdn);
	    j++;
	}
	tdn = window.document.createElement('td');
	if (parsedcert.subject.alt_names) {
	    alts = parsedcert.subject.alt_names;
	    l = alts.length;
	    ul = window.document.createElement('ul');
	    c = 0;
	    while (c < l) {
	        altstr = alts[c][0]
	            + ': '
	            + alts[c][1]
	        ;
	        tn = window.document.createTextNode(altstr);
	        li = window.document.createElement('li');
	        li.appendChild (tn);
	        ul.appendChild (li);
	        c++;
	    }
	    tdn.appendChild (ul);
	}
	localtr.appendChild (tdn);

	return localtr;
}
let certtable = function (parsedcerts, signers)
{
	let l;
	let thr;
	let th;
	let tn;
	let certtcont =
	    window.document.createElement('div');
	let certt = 
	    window.document.createElement('table');

	/* create header row */
	thr =
	    window.document.createElement('tr');
	th =
	    window.document.createElement('th');
	tn =
	    window.document.createTextNode('#');

	th.appendChild (tn);
	thr.appendChild (th);

	th =
	    window.document.createElement('th');
	tn =
	    window.document.createTextNode('Serial #');
	th.appendChild (tn);
	thr.appendChild (th);

	th =
	    window.document.createElement('th');
	tn =
	    window.document.createTextNode('Subject DN');
	th.appendChild (tn);
	thr.appendChild (th);

	th =
	    window.document.createElement('th');
	tn =
	    window.document.createTextNode('Issuer DN');
	th.appendChild (tn);
	thr.appendChild (th);

	th =
	    window.document.createElement('th');
	tn =
	    window.document.createTextNode('Subject Alt Name');
	th.appendChild (tn);
	thr.appendChild (th);

	certt.appendChild (thr);
	/* End create header table */

	if (signers !== undefined
	    && signers.length !== undefined
	    && signers.length > 0) {
	    let sp =
	        window.document.createElement('span');
	    let str = 'Signers: ';
	    str += signers[0];
	    let c = 1;
	    while (c < signers.length) {
	        str += ', '
	            + signers[c]
	        ;
	        c++;
	    }
	    let tn =
	        window.document.createTextNode(str);
	    sp.appendChild (tn);
	    certtcont.appendChild (sp);
	}
	c = 0;
	l = parsedcerts.length;

	while (c < l) {
	    let tr =  certtablerow (parsedcerts[c], c);
	    certt.appendChild (tr);
	    c++;
	}
	certtcont.appendChild (certt);
	
	return certtcont;
}
let dlblob = function (pkcs12AsBlob)
{
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
}
