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
            'data-index': index,
            'data-toggle':'modal',
            'data-target':'#productModal'
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
            type:'button',
            'data-index':index
        });
        upBtn.on('click', function() {
            var product = products[$(this).data('index')];
            var form = $('<form />');
            var input = $('<input />', {'type':'hidden', 'name':'ordinal', 'value':product.ordinal - 15});
            form.append(input);
            var data = new FormData(form[0]);
            $.ajax({
                url: '/api/products/' + product.id,
                type: 'PUT',
                enctype: 'multipart/form-data',
                data: data,
                processData: false,
                contentType: false
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
        var upBtnInner = $('<span />', {class:'glyphicon glyphicon-arrow-up', 'aria-hidden':true});
        upBtn.append(upBtnInner);
        upBtn.append(' Up');

        var downBtn = $('<div />', {
            class:'btn btn-primary',
            type:'button',
            'data-index':index
        });
        downBtn.on('click', function() {
            var product = products[$(this).data('index')];
            var form = $('<form />');
            var input = $('<input />', {'type':'hidden', 'name':'ordinal', 'value':product.ordinal + 15});
            form.append(input);
            var data = new FormData(form[0]);
            $.ajax({
                url: '/api/products/' + product.id,
                type: 'PUT',
                enctype: 'multipart/form-data',
                data: data,
                processData: false,
                contentType: false
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
                row.append($('<td />', {text:dateFormat(startTime, 'mm/dd/yyyy h:MM TT')}));
                row.append($('<td />', {text:dateFormat(endTime, 'mm/dd/yyyy h:MM TT')}));

                var opts = $('<td />');
                var optGroup = $('<div />', {class:'btn-group'});

                var priceIndex = i;
                var priceEditBtn = $('<div />', {
                    class:'btn btn-default btn-xs',
                    type:'button',
                    'data-toggle':'modal',
                    'data-target':'#priceModal',
                    'data-index':index,
                    'data-priceindex':priceIndex
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
            'data-index': index
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
                modal.find('.modal-body #confirm').off(); // remove all handlers
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
                modal.find('.modal-body #confirm').off(); // remove all handlers
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

        $('#productModal').on('show.bs.modal', function(event) {
            var button = $(event.relatedTarget);
            var modal = $(this);
            var index = button.data('index');
            var confirmBtn = modal.find('.modal-body #confirm');

            confirmBtn.empty();

            if(index >= 0) {
                var product = products[index];
                modal.find('#name').val(product.name);
                modal.find('#img').val('');

                var span = $('<span />', {class:'glyphicon glyphicon-ok-circle'});
                confirmBtn.append(span, ' Update')

                confirmBtn.off(); // clear old handlers
                confirmBtn.on('click', function() {
                    var form = modal.find('#productModalForm')[0];
                    var data = new FormData(form);
                    modal.modal('hide');
                    $.ajax({
                        url: '/api/products/' + products[index].id,
                        type: 'PUT',
                        enctype: 'multipart/form-data',
                        data: data,
                        processData: false,
                        contentType: false
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
                modal.find('#name').val('');
                modal.find('#img').val('');

                var span = $('<span />', {class:'glyphicon glyphicon-ok-circle'});
                confirmBtn.append(span, ' Add')

                confirmBtn.off(); // clear old handlers
                confirmBtn.on('click', function() {
                    var form = modal.find('#productModalForm')[0];
                    var data = new FormData(form);
                    modal.modal('hide');
                    $.ajax({
                        url: '/api/products/',
                        type: 'POST',
                        enctype: 'multipart/form-data',
                        data: data,
                        processData: false,
                        contentType: false
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

        $('#priceModal').on('show.bs.modal', function(event) {
            var button = $(event.relatedTarget);
            var modal = $(this);
            var index = button.data('index');
            var priceIndex = button.data('priceindex');

            var confirmBtn = modal.find('.modal-body #confirm');
            confirmBtn.empty();

            if(index >= 0 && priceIndex >= 0) {
                var price = products[index].prices[priceIndex];
                modal.find('#price').val(price.price);
                modal.find('#pricetype').val(price.type);
                modal.find('#priceStartTimeInput').val(dateFormat(price.startTime * 1000, 'mm/dd/yyyy h:MM TT'))
                modal.find('#priceEndTimeInput').val(dateFormat(price.endTime * 1000, 'mm/dd/yyyy h:MM TT'))

                var span = $('<span />', {class:'glyphicon glyphicon-ok-circle'});
                confirmBtn.append(span, ' Update')

                confirmBtn.off(); // remove all handlers
                confirmBtn.on('click', function() {
                    var startTime = modal.find('#priceStartTimeInput').val();
                    startTime = Math.floor((new Date(startTime)).getTime() / 1000);
                    modal.find('#priceStartTimeInput').val(startTime);

                    var endTime = modal.find('#priceEndTimeInput').val();
                    endTime = Math.floor((new Date(endTime)).getTime() / 1000);
                    modal.find('#priceEndTimeInput').val(endTime);
                    
                    var form = modal.find('#priceModalForm')[0];
                    var data = new FormData(form);
                    modal.modal('hide');
                    $.ajax({
                        url: '/api/products/' + products[index].id + '/prices/' + price.id,
                        type: 'PUT',
                        enctype: 'multipart/form-data',
                        data: data,
                        processData: false,
                        contentType: false
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
                modal.find('#price').val('');
                modal.find('#pricetype').val('');
                modal.find('#priceStartTimeInput').val('');
                modal.find('#priceEndTimeInput').val('');

                var span = $('<span />', {class:'glyphicon glyphicon-ok-circle'});
                confirmBtn.append(span, ' Add')

                confirmBtn.off(); // remove all handlers
                confirmBtn.on('click', function() {
                    var startTime = modal.find('#priceStartTimeInput').val();
                    startTime = Math.floor((new Date(startTime)).getTime() / 1000);
                    modal.find('#priceStartTimeInput').val(startTime);

                    var endTime = modal.find('#priceEndTimeInput').val();
                    endTime = Math.floor((new Date(endTime)).getTime() / 1000);
                    modal.find('#priceEndTimeInput').val(endTime);
                    
                    var form = modal.find('#priceModalForm')[0];
                    var data = new FormData(form);
                    modal.modal('hide');
                    $.ajax({
                        url: '/api/products/' + products[index].id + '/prices/',
                        type: 'post',
                        enctype: 'multipart/form-data',
                        data: data,
                        processData: false,
                        contentType: false
                    }).then(
                        function(res) {
                            console.log(res);
                            update();
                        },
                        function(err) {
                            console.log(err);
                        }
                    )
                });
            }

        });

        //setInterval(update, 10000);
        update();
    });
})();
