(function() {

    function update() {
        $('#products').empty();
        $('#empty').show();

        $.ajax({
            url: 'api/products',
        }).then(
            function(res) {
                if(res && res.data && res.data.length != 0) {
                    var row = $('<div />', {class:'row'});

                    for(var i = 0; i < res.data.length; i++) {
                        var product = res.data[i];

                        if(product && product.prices && product.prices.length != 0) {

                            $('#empty').hide();

                            var productDiv = $('<div />', {class:'product col-xs-12 col-sm-12 col-md-6 col-lg-4'});
                            var panelDiv = $('<div />', {class:'panel panel-warning'});
                            var panelNumber = $('<div />', {class:'productNumber', text:i+1});
                            var panelHeader = $('<div />', {class:'panel-heading'});
                            var panelBody = $('<div />', {class:'panel-body'});
                            var innerRow = $('<div />', {class:'row'});
                            var imgCol = $('<div />', {class:'col-md-6'});
                            var img = $('<img />', {class:'img-responsive center-block', src:'img/' + product.img});
                            var dataCol = $('<div />', {class:'col-md-6'});

                            panelHeader.text(product.name);

                            for(var j = 0; j < product.prices.length; j++) {
                                var priceObj = product.prices[j];
                                var h3 = $('<h3 />');
                                var priceSpan = $('<span />', {class:'label label-default center-block'});
                                if(priceObj.type === "Combo") {
                                    priceSpan.addClass('combo');
                                }
                                var typeDiv = $('<div />', {class:'type', text:priceObj.type});
                                var priceDiv = $('<div />', {class:'price', text:priceObj.price});
                                priceSpan.append(typeDiv, priceDiv);
                                h3.append(priceSpan);
                                dataCol.append(h3);
                            }

                            imgCol.append(img);
                            innerRow.append(imgCol, dataCol);
                            panelBody.append(innerRow);
                            panelDiv.append(panelNumber, panelBody, panelHeader);
                            productDiv.append(panelDiv);

                            row.append(productDiv);
                        }
                    }
                    $('#products').append(row);
                }
            },
            function(err) {
                console.log(err);
            }
        );
    }

    //setInterval(update, 10000);
    update();

})();
