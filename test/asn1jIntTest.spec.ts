import * as asn1js from "asn1js";
import * as assert from "assert";
import {createCMSECDSASignature} from "../src";
import {Convert} from "pvtsutils";

const testVectors = [
    {
        rHex: "010fc11f9fa733d62042904c2a4f5077d84a0cb61162e10dec784830521327a4a50d8be8a7b3778568a6c51355519ea12dad6347583c0ff6921285c7ed3db7439586",
        sHex: "00008bde7dadfe9ce0563383ef6dc2f06a6cb35f72cc66b5626bf91a1508b309207390ff302164c2e78f7e2958ee8d9e9cc7cca4a6a20cb9a011b0850212a50ca515"

    },
    {   rHex: "00000000068e322ecf4487d24ab2484276f20f5b660e1f651df2d24623f74e216588de5fe4ee65b84cb62579e06dedb4be87bd96e0d9726ac64f6cdfd4369465b31b",
        sHex: "01ead398135ff59757a0400074f885a7a22eb624349d3cd245309266f7229e8ca977492634b8960c2ea86215d8a9dcfb8d3e17775bcbf33cf46f1f8e8d7c3f3e4c53"

    },
    {
        rHex: "000000000000000000000000000000000000000000000000000000000000000000000000000000000001",
        sHex: "000000000000000000000000000000000000000000000000000000000000000000000000000000000002"
    },
    {   rHex: "52e3f7b727fba9e8eddb1d083b75c1882517e6dc63ded9c0524f8f9a45dc8661",
        sHex: "b8930438de8d33bdab12c3a2bdad979592a1fd6576d1734c3eb0af340456aef4"
    },
];

describe("createCMSECDSASignature - ", () => {
    testVectors.forEach(({ rHex, sHex }, no) => {
        it(`should encode signature vector #${no+1} correctly`, () => {
            const signatureBuffer = Convert.FromHex(rHex + sHex);
            const derBuffer = createCMSECDSASignature(signatureBuffer);
            const asn1 = asn1js.fromBER(derBuffer);

            const seq = asn1.result as asn1js.Sequence;
            const [rInt, sInt] = seq.valueBlock.value as [asn1js.Integer, asn1js.Integer];

            const rValueHex = Convert.ToHex(rInt.valueBlock.valueHexView);
            const sValueHex = Convert.ToHex(sInt.valueBlock.valueHexView);

            assert.ok(rValueHex.endsWith(rHex.replace(/^00+/, "")), "r not encoded correctly");
            assert.ok(sValueHex.endsWith(sHex.replace(/^00+/, "")), "s not encoded correctly");
        });
    });
});