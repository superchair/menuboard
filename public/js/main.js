(function() {
    $.ajax({
        url: 'api/products',
    }).then(
        function(res) {
            if(res && res.data && res.data.length != 0) {
                for(var i = 0; i < res.data.length; i++) {
                    var product = res.data[i];
                    console.log(product);

                    var productDiv = $('<div />', {class:'col-md-6'});
                    var panelDiv = $('<div />', {class:'panel panel-warning'});
                    var panelHeader = $('<div />', {class:'panel-heading'});
                    var panelBody = $('<div />', {class:'panel-body'});
                    var innerRow = $('<div />', {class:'row'});
                    var imgCol = $('<div />', {class:'col-md-6'});
                    var img = $('<img />', {class:'img-responsive center-block', src:'img/' + product.img});
                    var dataCol = $('<div />', {class:'col-md-6'});
                    var h3 = $('<h3 />');
                    var priceSpan = $('<span />', {class:'label label-default center-block'});

                    //TODO
                    panelHeader.text(product.name);
                    priceSpan.text('Combo $2.99');

                    h3.append(priceSpan);
                    dataCol.append(h3);
                    imgCol.append(img);
                    innerRow.append(imgCol, dataCol);
                    panelBody.append(innerRow);
                    panelDiv.append(panelHeader, panelBody);
                    productDiv.append(panelDiv);

                    $('#products').append(productDiv);
                }
            }
        },
        function(err) {
            console.log(err);
        }
    );

})();
