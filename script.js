//------------------------------------DRAG N DROP ---------------------------------------------
	//cài đặt cho phép drop
	function allowDrop(ev) {
		ev.preventDefault();
	}
	//kéo
	function drag(ev, element, field, toClass) {
		//var id = 'drag-'+(new Date()).getTime();
		//element.id = id;
		if($(element).hasClass('alreadyIn')){return 0;}
		var targetTxt = "";
		switch(field) {
			case "id":
			targetTxt = ev.target.id;
			break;
			case "class":
			targetTxt = ev.target.className;
			break;
			case "text":
			targetTxt = $(ev.target).text();
			break;
			default:
			if($(element).attr(field)){
				field = field.replace("data-","");
				targetTxt = $(ev.target).data(field);
			} else {
				targetTxt = $(ev.target).text();
			}
		}
		var newClass = ev.target.className.replace(toClass, "");
		ev.originalEvent.dataTransfer.setData("source",targetTxt) ;//lấy id của phần tử đang drag và gán vào biến source
		ev.originalEvent.dataTransfer.setData("newClass", newClass) ;
		ev.originalEvent.dataTransfer.setData("toClass",toClass) ;
	}
	//thả
	function drop(ev, element, toClass, format, autoIncrease, allowDuplicate) {
		var ts = '';
		//autoIncrease = true thì cho thêm tham số tự động tăng
		if(autoIncrease){
			ts = $(element).children("span").length + 1;
			ts = ts + ": ";
		}

		ev.preventDefault();
		var elmData = ev.originalEvent.dataTransfer.getData('source');//lấy giá trị biến source và gán vào biến elm_id
		var newClass = ev.originalEvent.dataTransfer.getData('newClass');
		var dropAreaClass = ev.originalEvent.dataTransfer.getData('toClass');
		if(dropAreaClass !== toClass) return;
		if(elmData === "")return; //ko co data
		if(ev.target.nodeName == "TEXTAREA" || ev.target.nodeName == "INPUT"){
			$(element).val(elmData);
		}

		//Ko cho phép trùng hay ko(default false)
		if(allowDuplicate){
			$(element).append("<span class='"+newClass+"'>" + format + ts + elmData+"</span>");
		} else {
			if($(element).text().indexOf(elmData) === -1){
				$(element).append("<span class='"+newClass+"'>" + format + ts + elmData+"</span>");
			}
		}
		

		if(!elmData){return}
			$(".dropErr").text("");
			//$(element).html($(element).text()+elm_id);
	}
	//function drag từ fromClass đến toClass và tên trường (id, class, text, data-*)
	function allowDrag(fromClass, toClass, field = "text", autoIncrease=false, format="", allowDuplicate = false){
		$("."+fromClass).addClass("dragItem");
		$(document).on("mousedown",".alreadyIn, ." + fromClass,function(){
			$("."+fromClass).attr("draggable","true");
			$(".alreadyIn").attr("draggable","true");
		})
		//kéo phần từ qua vùng cho phép drop thì hiện dấu cho phép drop
		$(document).on("dragover","."+toClass,function(event){
			allowDrop(event);
		});
		$(document).on("dragstart",".alreadyIn, ."+fromClass, function(event){
			//dragstart_handler(event);
			drag(event, this, field, toClass);
		});
		$(document).on("drop","."+toClass,function(event){
			if($(this).hasClass(toClass)){
				$("."+toClass).addClass("dragTarget");
				drop(event, this, toClass, format, autoIncrease, allowDuplicate);
				$(this).children().addClass("alreadyIn"); //dấu hiệu thêm class alreadyIn để phân biệt cái nào đã được drop vào rồi
			}
		});
		//drag phần từ trong ô ra ngoài thì xóa phần tử đó (ko áp dụng cho ô input)
		$(document).on("dragend",".alreadyIn" ,function(){
			if(document.elementFromPoint(event.pageX, event.pageY) === null || document.elementFromPoint(event.pageX, event.pageY).className.search(toClass) === -1){
				//console.log($(this).text()[1]);
				//drag thêm số thứ tự
				//console.log($(this).siblings().length);
				if(document.elementFromPoint(event.pageX, event.pageY).className.search("alreadyIn") !== -1) return 0;
				for(var i = parseInt($(this).text()[format.length] - 1); i < parseInt($(this).siblings().length); i++){
					var nextTxt=i+2;
					var currentTxt = $(this).parent().find("span:nth-child("+nextTxt+")").text();
					var newTxt = currentTxt.replace(i+2,i+1);
					$(this).parent().find("span:nth-child("+nextTxt+")").text(newTxt);
				}
				$(this).remove();
			}
		});
	}
	//allowDrag("fromClass", "toClass", "field", "data format", "auto increase")
	//field: "id", "class", "text" (default), "data-*" (vd: "data-value")
	//data format là ký tự dc thêm vào đầu đoạn text của phần tử drag
	//auto inscrease = true(default) or false
	//vd allowDrag("dragThamSoItem","dragThamSoArea","text",true, "$T");




//--------------------------------------------Calendar----------------------------

    Date.prototype.getDaysInMonth = function(month){
        var date = new Date(this.getFullYear(), month, 1);
        var days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };
    function getAllDateOfYear(year){
        var date = new Date(year.toString());
        var result = [
            [],[],[],[],[],[],[],[],[],[],[],[]
        ];
        for(var i = 0; i < 12; i++){
            var r = date.getDaysInMonth(i);
            //k: only date (1 - 31), v: full date Fri Dec 14 2018 00:00:00 GMT+0700 (+07)
            $.each(r, function(k, v){
                //var formatted = v.getDate() + '/' + (v.getMonth() +1) + '/' + v.getFullYear();
                //var formatted = v;
                //result.push(formatted);
                result[v.getMonth()].push([v]);
            });
        }
        return result;
    }
    function createCalendar(year, size = 'large'){
    	if($('#calendar').length > 0) $('#calendar').empty();
    	else $('body').append("<div id='calendar'></div>");
    	
        var aYear = getAllDateOfYear(year);
        var now = new Date;var strClass = '';

        for(var i = 1; i <= aYear.length; i++){
            $('#calendar').append("<table class='month"+i+"'></table>");
            $('.month'+i).append("<thead>\n\
                <tr>\n\
                    <th colspan='7'><h2>Tháng "+i+"</h2></th>\n\
                </tr>\n\
                <tr>\n\
                    <th class='daysInWeek'>T2</th>\n\
                    <th class='daysInWeek'>T3</th>\n\
                    <th class='daysInWeek'>T4</th>\n\
                    <th class='daysInWeek'>T5</th>\n\
                    <th class='daysInWeek'>T6</th>\n\
                    <th class='daysInWeek'>T7</th>\n\
                    <th class='daysInWeek'>CN</th>\n\
                </tr></thead>");
            $('.month'+i).append("<tbody class='month"+i+"body'></tbody>");

            var currentWeek;

            for(var j = 0; j < aYear[i-1].length; j++){

                var dateFromArr = new Date(aYear[i-1][j]);
                var formatted = dateFromArr.getDate() + '/' + (dateFromArr.getMonth() +1) + '/' + dateFromArr.getFullYear();
                var day = dateFromArr.getDay();
                var onlyDate = dateFromArr.getDate();
                var colspan = day - 1;

                if(day === 0) colspan = 6;
                if(onlyDate === 1){
                    currentWeek = 1;
                    $('.month'+i+'body').append("<tr class='m"+i+"w"+currentWeek+"'></tr>");
                    if(colspan !== 0) $('.m'+i+'w'+currentWeek).append("<td colspan="+colspan+"></td>");
                }
                //console.log(formatted);//in ra tat ca ngay/thang/nam
                strClass = '';
                if(day === 1 && onlyDate !== 1){//thu 2
                    //if(onlyDate === 7 && j === 0) alert("ngay 7");
                    $('.month'+i+'body').append("<tr class='m"+i+"w"+currentWeek+"'></tr>");
                }
                if(day === 0) strClass += ' weekend';
                if(dateFromArr.getDate() == now.getDate() && dateFromArr.getMonth() == now.getMonth() && dateFromArr.getFullYear() == now.getFullYear()){
                	strClass += ' today';
                }
                $('.m'+i+'w'+currentWeek).append("<td class='"+strClass+"'><a class='"+strClass+" date' data-dateformatted='"+formatted+"' href='#modal-event'  data-toggle='modal'>"+onlyDate+"</a></td>");
                if(day === 0) currentWeek++;

            }
            if(size == 'medium'){
            	$('#calendar').css('font-size','12px');
            	$('table[class^="month"]').css('width','20%');
            } else if(size == 'small'){
            	$('#calendar').css('font-size','10px');
            	$('table[class^="month"]').css('width','16%');
            }
        }
    }
	