(function() {

    function update() {
        $('#products').empty();
        $('#empty').show();

        $.ajax({
            url: '/api/products',
        }).then(
            function(res) {
                if(res && res.data && res.data.length != 0) {
                    for(var i = 0; i < res.data.length; i++) {
                        var product = res.data[i];

                        if(product && product.prices && product.prices.length != 0) {

                            $('#empty').hide();

                            var productDiv = $('<div />', {class:'col-md-6'});
                            var panelDiv = $('<div />', {class:'panel panel-warning'});
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
                                priceSpan.text(priceObj.type + ' $' + priceObj.price);
                                h3.append(priceSpan);
                                dataCol.append(h3);
                            }

                            imgCol.append(img);
                            innerRow.append(imgCol, dataCol);
                            panelBody.append(innerRow);
                            panelDiv.append(panelHeader, panelBody);
                            productDiv.append(panelDiv);

                            $('#products').append(productDiv);
                        }
                    }
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
