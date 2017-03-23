(function() {

    var products;

    function buildProductDom(index, product) {
        var productDiv = $('<div />', {class:'panel panel-warning', 'data-index': index});
        
        var panelHeading = $('<div />', {class:'panel-heading', text:product.name});

        var panelBody = $('<div />', {class:'panel-body'});

        var mainRow = $('<div />', {class:'row'});

        var imgCol = $('<div />', {class:'col-md-4'});
        var img = $('<img />', {class:'img-responsive center-block', src:'img/' + product.img});

        var bodyCol = $('<div />', {class:'col-md-8'});
        var bodyRow = $('<div />', {class:'row'});

        var buttonCol1 = $('<div />', {class:'col-md-6 text-center'});
        var buttonCol2 = $('<div />', {class:'col-md-6 text-center'});

        var buttonGrp1 = $('<div />', {class:'btn-group'});
        var buttonGrp2 = $('<div />', {class:'btn-group'});

        var editBtn = $('<div />', {
            class:'btn btn-default',
            type:'button'
        }).attr({
            'data-toggle':'modal',
            'data-target':'editProduct'
        });
        var editBtnInner = $('<span />', {class:'glyphicon glyphicon-pencil', 'aria-hidden':true});
        editBtn.append(editBtnInner);
        editBtn.append(' Edit');

        var deleteBtn = $('<div />', {
        }).attr({
            class:'btn btn-danger',
            type:'button',
            'data-toggle':'modal',
            'data-target':'#confirmDelete',
            'data-index':index,
            'data-type':'product'
        });
        var deleteBtnInner = $('<span />', {class:'glyphicon glyphicon-remove','aria-hidden':true});
        deleteBtn.append(deleteBtnInner);
        deleteBtn.append(' Delete');

        var upBtn = $('<div />', {
            class:'btn btn-primary',
            type:'button'
        });
        var upBtnInner = $('<span />', {class:'glyphicon glyphicon-arrow-up', 'aria-hidden':true});
        upBtn.append(upBtnInner);
        upBtn.append(' Up');

        var downBtn = $('<div />', {
            class:'btn btn-primary',
            type:'button'
        });
        var downBtnInner = $('<span />', {class:'glyphicon glyphicon-arrow-down', 'aria-hidden':true});
        downBtn.append(downBtnInner);
        downBtn.append(' Down');

        var tableCol = $('<div />', {class:'col-md-12'});
        var table = $('<table />', {class:'table table-hover table-condensed'});
        tableCol.append(table);
        var thead = $('<thead />');
        thead.append($('<th />', {text:'Price'}));
        thead.append($('<th />', {text:'Type'}));
        thead.append($('<th />', {text:'Starts'}));
        thead.append($('<th />', {text:'Ends'}));
        thead.append($('<th />', {text:'Options'}));
        table.append(thead);

        var prices = product.prices;
        if(prices && prices.length) {
            for(var i = 0; i < prices.length; i++) {
                var price = prices[i];
                var startTime = new Date(price.startTime * 1000);
                var endTime = new Date(price.endTime * 1000);
                var row = $('<tr />');
                row.append($('<td />', {text:'$' + price.price}));
                row.append($('<td />', {text:price.type}));
                row.append($('<td />', {text:dateFormat(startTime, 'H:MM m/d/yy')}));
                row.append($('<td />', {text:dateFormat(endTime, 'H:MM m/d/yy')}));

                var opts = $('<td />');
                var optGroup = $('<div />', {class:'btn-group'});

                var priceEditBtn = $('<div />', {
                    class:'btn btn-default btn-xs',
                    type:'button',
                    'data-toggle':'modal',
                    'data-target':'editPrice'
                });
                var priceEditBtnInner = $('<span />', {class:'glyphicon glyphicon-pencil', 'aria-hidden':true});
                priceEditBtn.append(priceEditBtnInner);

                var priceDeleteBtn = $('<div />', {
                    class:'btn btn-danger btn-xs',
                    type:'button',
                }).attr({
                    'data-toggle':'modal',
                    'data-target':'#confirmDelete',
                    'data-index': index,
                    'data-priceid': price.id,
                    'data-type':'price'
                });
                var priceDeleteBtnInner = $('<span />', {class:'glyphicon glyphicon-remove', 'aria-hidden':true});
                priceDeleteBtn.append(priceDeleteBtnInner);

                optGroup.append(priceEditBtn, priceDeleteBtn);
                opts.append(optGroup);
                row.append(opts);

                table.append(row);
            }
        }

        var addPriceCol = $('<div />', {class:'col-md-12 text-center'});
        var priceAddBtn = $('<div />', {
            class:'btn btn-primary',
            type:'button',
        }).attr({
            'data-toggle':'modal',
            'data-target':'#priceModal',
        });
        var priceAddBtnInner = $('<span />', {class:'glyphicon glyphicon-plus', 'aria-hidden':true});
        priceAddBtn.append(priceAddBtnInner, ' Add Price');
        addPriceCol.append(priceAddBtn);

        buttonGrp1.append(editBtn, deleteBtn);
        buttonGrp2.append(upBtn, downBtn);
        buttonCol1.append(buttonGrp1);
        buttonCol2.append(buttonGrp2);
        bodyRow.append(buttonCol1, buttonCol2, tableCol, addPriceCol);
        bodyCol.append(bodyRow);
        imgCol.append(img);
        mainRow.append(imgCol, bodyCol);
        panelBody.append(mainRow);
        productDiv.append(panelHeading, panelBody);
        
        return productDiv;
    }

    function update() {
        $('#products').empty();
        $('#empty').show();

        $.ajax({
            url: '/api/products?fullList=true',
        }).then(
            function(res) {
                if(res && res.data && res.data.length != 0) {

                    products = res.data ? res.data : [];

                    for(var i = 0; i < res.data.length; i++) {
                        var product = res.data[i];
                        var productDiv = buildProductDom(i, product);
                        $('#products').append(productDiv);
                    }

                    if(products.length > 0) {
                        $('#empty').hide();
                    }
                }
            },
            function(err) {
                console.log(err);
            }
        );
    }

    $(document).ready(function() {
        $('#confirmDelete').on('show.bs.modal', function(event) {
            var button = $(event.relatedTarget);
            var modal = $(this);

            var type = button.data('type');
            if(type == 'product') {
                modal.find('.modal-body #text').text('Are you sure you want to delete product?');
                modal.find('.modal-body #confirm').on('click', function() {
                    var index = button.data('index');
                    var product = products[index];
                    modal.modal('hide');
                    $.ajax({
                        url: '/api/products/' + product.id,
                        type: 'DELETE'
                    }).then(
                        function(res) {
                            console.log(res);
                            update();
                        },
                        function(err) {
                            console.log(err);
                        }
                    );
                });
            } else {
                // price
                modal.find('.modal-body #text').text('Are you sure you want to delete price?');
                modal.find('.modal-body #confirm').on('click', function() {
                    var index = button.data('index');
                    var product = products[index];
                    var priceId = button.data('priceid');
                    modal.modal('hide');
                    $.ajax({
                        url: '/api/products/' + product.id + '/prices/' + priceId,
                        type: 'DELETE'
                    }).then(
                        function(res) {
                            console.log(res);
                            update();
                        },
                        function(err) {
                            console.log(err);
                        }
                    );
                });
            }
        });

        //setInterval(update, 10000);
        update();
    });
})();
