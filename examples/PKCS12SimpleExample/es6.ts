import * as utils from "../../test/utils";
import * as example from "../../test/pkcs12SimpleExample";
import * as common from "../common";

function destroyClickedElement(event: any) {
  document.body.removeChild(event.target);
}

function saveFile(result: ArrayBuffer) {
  const pkcs12AsBlob = new Blob([result], { type: "application/x-pkcs12" });
  const downloadLink = document.createElement("a");
  downloadLink.download = "pkijs_pkcs12.p12";
  downloadLink.innerHTML = "Download File";

  downloadLink.href = window.URL.createObjectURL(pkcs12AsBlob);
  downloadLink.onclick = destroyClickedElement;
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);

  downloadLink.click();
}

async function passwordBasedIntegrity(password?: string) {
  if (!password) {
    password = common.getElement("password2", "input").value;
  }

  const pfx = await example.passwordBasedIntegrity(password);
  saveFile(pfx);
}

async function certificateBasedIntegrity() {
  const pfx = await example.certificateBasedIntegrity();
  saveFile(pfx);
}

async function noPrivacy() {
  await passwordBasedIntegrity(common.getElement("password3", "input").value); // Same with previous example
}

async function passwordPrivacy() {
  const pfx = await example.passwordPrivacy(common.getElement("password4", "input").value);
  saveFile(pfx);
}

async function certificatePrivacy() {
  const pfx = await example.certificatePrivacy(common.getElement("password5", "input").value);
  saveFile(pfx);
}

async function openSSLLike() {
  const pfx = await example.openSSLLike(common.getElement("password1", "input").value);
  saveFile(pfx);
}

async function parsePKCS12(buffer: ArrayBuffer) {
  const pkcs12 = await example.parsePKCS12(buffer, common.getElement("password", "input").value);
  const result: string[] = [];

  //#region Store X.509 certificate value
  if (!(pkcs12.parsedValue && pkcs12.parsedValue.authenticatedSafe)) {
    throw new Error("pkcs12.parsedValue.authenticatedSafe is empty");
  }
  const certificateBuffer = pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[1].value.safeBags[0].bagValue.parsedValue.toSchema().toBER(false);

  result.push(utils.toPEM(certificateBuffer, "CERTIFICATE"));
  //#endregion

  //#endregion Store PKCS#8 (private key) value
  const pkcs8Buffer = pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue.parsedValue.toSchema().toBER(false);
  result.push(utils.toPEM(pkcs8Buffer, "PRIVATE KEY"));
  //#endregion

  // noinspection InnerHTMLJS
  common.getElement("parsing_result").innerHTML = result.join("\n");
}

function handlePKCS12(evt: any) {
  common.handleFileBrowse(evt, file => {
    parsePKCS12(file)
      .catch(e => {
        console.error(e);
        alert("Error on PKCS#12 parsing. See developer console for more details");
      });
  });

}

common.getElement("open_ssl_like").addEventListener("click", openSSLLike);
common.getElement("password_based_integrity").addEventListener("click", () => passwordBasedIntegrity());
common.getElement("certificate_based_integrity").addEventListener("click", certificateBasedIntegrity);
common.getElement("no_privacy").addEventListener("click", noPrivacy);
common.getElement("password_privacy").addEventListener("click", passwordPrivacy);
common.getElement("certificate_privacy").addEventListener("click", certificatePrivacy);
common.getElement("pkcs12_file").addEventListener("click", handlePKCS12);