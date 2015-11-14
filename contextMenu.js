 //конструктор класса контекстного меню, OBJECT_TYPE - тип пбъекта всего меню ITEM_TYPE - тип пункта меню
 function ContextWeightMenu(weightArray,quantityArray,actionCallback,actionProcess,OBJECT_TYPE,ITEM_TYPE)
 {
	this.OBJECT_TYPE=OBJECT_TYPE;
	this.ITEM_TYPE=ITEM_TYPE;
	this.weightArray = weightArray;//массив доступных граммажей только из значений
	this.actionCallback = actionCallback;//функция анимации вида function(<"название_события">, БЛОК_DOM, ТИП_ОБЪЕКТА)
	this.quantityArray = quantityArray;//массив из БД количеств товара вида [{Id:<айди_номер_товара>,Quantity:<кол-во товара на складе минус кол-во зарезервированного товара>}{}{}]
	this.actionProcess = actionProcess;//функция обработки значения нажатой кнопки вида function(БЛОК_DOM);
	this.Menu_ref = this.createMenu();
	this.makeAction();
	this.avail_Qty=-1;//доступное кол-во товара
	this.fl_appended=false;//флаг подключения меню к родительскому элементу
 }
 ContextWeightMenu.prototype.createMenu = function()
 {
	var ParentDiv = document.createElement("ul");
	ParentDiv.className="menu";
	ParentDiv.setAttribute("pack-id",-1);
	//ParentDiv.setAttribute("quantity",-1);
	ParentDiv.innerText = "ВЫБЕРИТЕ ВЕС";
	ParentDiv.id = "menu-container";
	this.weightArray.forEach(function(item)
	{
		//создание пунктов
		var newLi = document.createElement("li");
		newLi.className = "menu";
		newLi.setAttribute("quantity",item);
		newLi.setAttribute("selected-before",false);
		newLi.innerText = item + " гр.";
		ParentDiv.appendChild(newLi);
	});
	return ParentDiv;
 }
 //product_id - идентификатор товара
 ContextWeightMenu.prototype.initializeMenu = function(product_id)
 {
	
	var thisREF = this;
	this.Menu_ref.setAttribute("pack-id",product_id);
	this.Menu_ref.style.cursor="pointer";
	//ищем граммаж для товара
	this.quantityArray.forEach(function(item)
	{
		if(item.Id == product_id)
		{
			thisREF.avail_Qty = item.Quantity;
		}
	});
	
	//this.displayMenu(avail_Qty);
 }
 ContextWeightMenu.prototype.displayMenu = function()
 {
	this.Menu_ref.style.display = "block";
	for(var i=0;i<this.Menu_ref.children.length;i++)
	{
		if(this.Menu_ref.children[i].getAttribute("quantity")>this.avail_Qty)
		{
			this.Menu_ref.children[i].style.display = "none";
		}
		else
		{
			this.Menu_ref.children[i].style.display = "block";
		}
	}
 }
 ContextWeightMenu.prototype.displayNoneMenu = function()
 {
	for(var i=0;i<this.Menu_ref.children.length;i++)
	{
		this.Menu_ref.children[i].style.display = "none";
	}
	this.Menu_ref.style.display = "none";
 }
 ContextWeightMenu.prototype.refreshMenu = function()
 {
	for(var i=0;i<this.Menu_ref.children.length;i++)
	{
		this.Menu_ref.children[i].setAttribute("selected-before",false);
		//отщелкнуть все кнопки
		//actionCallBack_off(this.Menu_ref.children[i]);
		this.actionCallback("mouseout",this.Menu_ref.children[i],this.ITEM_TYPE);
	}
 }
 ContextWeightMenu.prototype.disableOthers = function(DOM_Object)
 {
	//console.log(_WeightArray);
	var menuref = this.Menu_ref;
	var action = this.actionCallback;
	var TYPE = this.ITEM_TYPE;
	var Quantity = DOM_Object.getAttribute("quantity");
	//получаем 
	this.weightArray.forEach(function(item,_i)
	{
		if(item!=Quantity)
		{
			//выбираем только тех, которые нажимали
			if(menuref.children[_i].getAttribute("selected-before")=="true")
			{
				//actionCallBack_off(menu.children[_i]);
				action("mouseout",menuref,TYPE);
				menuref.children[_i].setAttribute("selected-before",false);
			}
		}
	});
 }
 ContextWeightMenu.prototype.makeAction = function()
 {
	var thisRef = this;
	for(var i=0;i<this.Menu_ref.children.length;i++)
	{
		//var child_ref = children[i];
		this.Menu_ref.children[i].addEventListener("click",function(event)
		{
			event.stopPropagation();
			//event.preventDefault();
			//если первый раз нажали
			//console.log(event.target.getAttribute("selected-before"));
			var sb_flag = event.target.getAttribute("selected-before");
			if(event.target.getAttribute("selected-before")=="false")
			{
				//нажатие - анимация
				//actionCallBack_on(event.target);
				thisRef.actionCallback("click",event.target,this.ITEM_TYPE);
				event.target.setAttribute("selected-before",true);
				//для остальных выключение
				thisRef.disableOthers(event.target);
				//изменяем переменную
				thisRef.actionProcess({Id:event.target.parentNode.getAttribute("pack-id"),Quantity:event.target.getAttribute("quantity")});
				//console.log("выбрано количество товара: ",event.target.getAttribute("quantity"));
				thisRef.refreshMenu();
				thisRef.displayNoneMenu();
				//console.log(event.target);	
				
				
				
				var podlogka = document.getElementById("podlogka");
				document.body.removeChild(podlogka);
			}
		});
	}
 }
ContextWeightMenu.prototype.displayMenuAtCursor = function(cursor_left,cursor_top)
{
	//если создаем меню в 1 раз
	if(this.fl_appended==false)
	{
		document.body.appendChild(this.Menu_ref);
		fl_appended=true;
	}
	this.Menu_ref.style.position="absolute";
	//устанавливаем тот же идентификатор, что и у ParentElement
	//this.Menu_ref.setAttribute("pack-id",ParentElement.getAttribute("pack-id"));
	this.Menu_ref.style.top = cursor_top;
	this.Menu_ref.style.left = cursor_left;
	////
	////делаем подложку
	////
	var podlogka = document.createElement("div");
	podlogka.id = "podlogka";
	document.body.appendChild(podlogka);
	this.displayMenu();
}
 
/*  function actionButton(TypeOfAction,DOM_Object,ITEM_TYPE)
 {
	switch(TypeOfAction)
	{
		case "click":
		//обрабатываем событие
		console.log("item_clicked: ",DOM_Object);
		break;
		case "mouseout":
		console.log("item_unclicked: ", DOM_Object);
		break;
		default:
		console.log("непонятно!");
		break;
	}
 } */
