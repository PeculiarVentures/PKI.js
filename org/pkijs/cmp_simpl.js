(
function(in_window)
{
    if(typeof in_window.org === "undefined")
        in_window.org = {};
    else
    {
        if(typeof in_window.org !== "object")
            throw new Error("Name org already exists and it's not an object");
    }

    if(typeof in_window.org.pkijs === "undefined")
        in_window.org.pkijs = {};
    else
    {
        if(typeof in_window.org.pkijs !== "object")
            throw new Error("Name org.pkijs already exists and it's not an object" + " but " + (typeof in_window.org.pkijs));
    }

    if(typeof in_window.org.pkijs.simpl === "undefined")
        in_window.org.pkijs.simpl = {};
    else
    {
        if(typeof in_window.org.pkijs.simpl !== "object")
            throw new Error("Name org.pkijs.simpl already exists and it's not an object" + " but " + (typeof in_window.org.pkijs.simpl));
    }

    if(typeof in_window.org.pkijs.simpl.cmp === "undefined")
        in_window.org.pkijs.simpl.cmp = {};
    else
    {
        if(typeof in_window.org.pkijs.simpl.cmp !== "object")
            throw new Error("Name org.pkijs.simpl.cmp already exists and it's not an object" + " but " + (typeof in_window.org.pkijs.simpl.cmp));
    }

    var local = {};

    /**
     * Common PKI message header
     *
     * When an object is passed, the keys must correspond to the ASN.1 spec
     * for a PKI message header.
     * Integers can be assigned directly, all other items need to be schema types.
     **/
    in_window.org.pkijs.simpl.cmp.PKIHeader =
    function()
    {
        this.pvno;
        this.sender;
        this.recipient;

        if((arguments[0] instanceof Object) && ('schema' in arguments[0])) {
            in_window.org.pkijs.simpl.cmp.PKIHeader.prototype.fromSchema.call(this, arguments[0].schema);
        } else {
            if(arguments[0] instanceof Object) {

                // Either 1 or 2
                this.pvno = new in_window.org.pkijs.asn1.INTEGER({ value: (arguments[0].pvno || 2) });
                this.sender = arguments[0].sender || new in_window.org.pkijs.schema.GENERAL_NAME();
                this.recipient = arguments[0].recipient || new in_window.org.pkijs.schema.GENERAL_NAME();

                // Optionals
                if ('messageTime' in arguments[0])
                    this.messageTime = arguments[0].messageTime || new in_window.org.pkijs.schema.TIME();
                if ('protectionAlg' in arguments[0])
                    this.protectionAlg = arguments[0].protectionAlg || new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER();
                //this.senderKID;
                //this.recipKID;
                if ('transactionID' in arguments[0])
                    this.transactionID = arguments[0].transactionID || new in_window.org.pkijs.asn1.OCTETSTRING();
                //this.senderNonce;
                //this.recipNonce;
                //this.freeText;
                if ('generalInfo' in arguments[0])
                    this.generalInfo = arguments[0].generalInfo || new in_windnow.org.pkijs.asn1.SEQUENCE();
            }
        }
    };

    in_window.org.pkijs.simpl.cmp.PKIHeader.prototype.fromSchema =
    function(schema)
    {
        var asn1 = in_window.org.pkijs.compareSchema(
            schema, schema,
            in_window.org.pkijs.schema.cmp.PKIHeader()
        );

        if (asn1.verified === false) {
            throw new Error('Could not verify PKI header schema');
        }

        this.pvno = asn1.result['PKIHeader.pvno'].value_block.value_dec;
        this.sender = new in_window.org.pkijs.simpl.GENERAL_NAME({ schema: asn1.result['PKIHeader.sender'] });
        this.recipient = new in_window.org.pkijs.simpl.GENERAL_NAME({ schema: asn1.result['PKIHeader.recipient'] });

        if ('PKIHeader.messageTime' in asn1.result)
            this.messageTime = asn1.result['PKIHeader.messageTime'];
        if ('PKIHeader.transactionID' in asn1.result)
            this.transactionID = asn1.result['PKIHeader.transactionID'];
        if ('PKIHeader.senderNonce' in asn1.result)
            this.senderNonce = asn1.result['PKIHeader.senderNonce'];
        if ('PKIHeader.recipNonce' in asn1.result)
            this.recipNonce = asn1.result['PKIHeader.recipNonce'];
        if ('PKIHeader.freeText' in asn1.result)
            this.freeText = asn1.result['PKIHeader.freeText'];
        if ('PKIHeader.generalInfo' in asn1.result)
            this.generalInfo = asn1.result['PKIHeader.generalInfo'];
    };

    in_window.org.pkijs.simpl.cmp.PKIHeader.prototype.toSchema =
    function()
    {
        var out = [];

        out.push(this.pvno);
        out.push(this.sender.toSchema());
        out.push(this.recipient.toSchema());

        if ('messageTime' in this)
            out.push(this.messageTime);
        if ('protectionAlg' in this)
            out.push(this.protectionAlg);
        if ('senderKID' in this)
            out.push(this.senderKID);
        if ('recipKID' in this)
            out.push(this.recipKID);
        if ('transactionID' in this)
            out.push(this.transactionID);
        if ('senderNonce' in this)
            out.push(this.senderNonce);
        if ('recipNonce' in this)
            out.push(this.recipNonce);
        if ('freeText' in this)
            out.push(this.freeText);
        if ('generalInfo' in this)
            out.push(this.generalInfo);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: out
        }));
    };

    in_window.org.pkijs.simpl.cmp.PKIMessage =
    function()
    {
        this.header;
        this.body;

        if((arguments[0] instanceof Object) && ('schema' in arguments[0])) {
            in_window.org.pkijs.simpl.cmp.PKIMessage.prototype.fromSchema.call(this, arguments[0].schema);
        } else {
            if(arguments[0] instanceof Object) {

                this.header = arguments[0].header || new in_window.org.pkijs.simpl.cmp.PKIHeader();
                this.body = arguments[0].body || new in_window.org.pkijs.asn1.SEQUENCE();
                if ('protection' in arguments[0])
                    this.protection = arguments[0].protection || new in_window.org.pkijs.asn1.BITSTRING();
            }
        }

    };

    in_window.org.pkijs.simpl.cmp.PKIMessage.prototype.fromSchema =
    function(schema)
    {
        var asn1 = in_window.org.pkijs.compareSchema(
            schema, schema,
            in_window.org.pkijs.schema.cmp.PKIBody()
        );

        if (asn1.verified === false) {
            throw new Error('Could not verify PKI body schema');
        }

        this.header = new in_window.org.pkijs.simpl.cmp.PKIHeader({ schema: asn1.result['PKIMessage.header'] });
        this.body = asn1.result['PKIMessage.body'];
        if ('PKIMessage.protection' in asn1.result)
            this.protection = asn1.result['PKIMessage.protection'];
    };

    in_window.org.pkijs.simpl.cmp.PKIMessage.prototype.toSchema =
    function()
    {
        var out = [];

        out.push(this.header);
        out.push(this.body);
        if ('protection' in this)
            out.push(this.protection);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: out
        }));
    };

    in_window.org.pkijs.simpl.cmp.InfoTypeAndValue =
    function()
    {
        this.infoType;
        this.infoValue;

        if((arguments[0] instanceof Object) && ('schema' in arguments[0])) {
            in_window.org.pkijs.simpl.cmp.InfoTypeAndValue.prototype.fromSchema.call(this, arguments[0].schema);
        } else {
            if(arguments[0] instanceof Object) {

                this.infoType = arguments[0].infoType || new in_window.org.pkijs.asn1.OID();

                // Optionals
                if ('infoValue' in arguments[0])
                    this.infoValue = arguments[0].infoValue || new in_window.org.pkijs.asn1.ANY();
            }
        }
    };

    in_window.org.pkijs.simpl.cmp.InfoTypeAndValue.prototype.fromSchema =
    function(schema)
    {
        var asn1 = in_window.org.pkijs.compareSchema(
            schema, schema,
            in_window.org.pkijs.schema.cmp.InfoTypeAndValue(
                {
                names: {
                    infoType: 'infoType',
                    infoValue: 'infoValue'
                }
            })
        );

        if (asn1.verified === false) {
            throw new Error('Could not verify InfoTypeAndValue schema');
        }

        this.infoType = asn1.result.infoType;
        if ('infoType' in asn1.result)
            this.infoValue = asn1.result.infoType;
    };

    in_window.org.pkijs.simpl.cmp.InfoTypeAndValue.prototype.toSchema =
    function()
    {
        var out = [];

        out.push(this.infoType.toSchema());
        if ('infoValue' in this)
            out.push(this.infoValue.toSchema());

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: out
        }));
    };
}
)(typeof exports !== "undefined" ? exports : window);
