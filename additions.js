//создание меню добавок
//OBJECT_TYPE - тип объекта-контейнера для запуска событий
//ITEM_TYPE - тип объекта-самой карточки добавки т.е. элемента контейнера
//CONTEXT_MENU_TYPE - тип объекта меню 
//CONTEXT_MENU_ITEM_TYPE - тип объекта - пункт меню 
// DataBase_CallBack(prod_item.Id,"quantity")
function Additions(_Product_Array_,weightArray,OBJECT_TYPE,ITEM_TYPE,CONTEXT_MENU_TYPE,CONTEXT_MENU_ITEM_TYPE,animationCallback,processCallback,DataBaseCallBack)
{
	//внешние переменные
	this.OBJECT_TYPE = OBJECT_TYPE;
	this.ITEM_TYPE = ITEM_TYPE;
	this.CONTEXT_MENU_ITEM_TYPE = CONTEXT_MENU_ITEM_TYPE;
	this.CONTEXT_MENU_TYPE = CONTEXT_MENU_TYPE;
	this.ProductArray = _Product_Array_;
	this.weightArray = weightArray;
	this.animationCallback = animationCallback;
	this.processCallback = processCallback;
	this.DataBaseCallBack = DataBaseCallBack;
	//показывались ли кнопки НАЗАД И ДАЛЕЕ
	this.fl_buttonsDisplayed=false;
	//внутренние переменные
	this.Elements=[];
	this.WithoutAdditionElement=null;
	//создание массива количеств
	this.quantityArray=[];
	for(var i=0;i<this.ProductArray.length;i++)
	{
		var reserved_quantity = this.DataBaseCallBack(this.ProductArray[i].Id,"quantity");
		this.quantityArray.push({Id:this.ProductArray[i].Id,Quantity:this.ProductArray[i].quantity-reserved_quantity});
	}
	var WithoutAdd = this.WithoutAdditionElement;
	var Elts = this.Elements;
	this.AdditionsMenuRef = createAdditionsMenu(this.ProductArray,this.weightArray,this.DataBaseCallBack);
	
	
	this.ResultArray = [];//результирующий массив.
	this.addToResultArray = function(Object)
	{
		var fl_found=false;
		for(var i=0;i<this.ResultArray.length;i++)
		{
			if((fl_found==false)&&(this.ResultArray[i].Id==Object.Id))
			{
				this.ResultArray[i].Quantity=Object.Quantity;
				fl_found=true;
				break;
			}
		}
		if(fl_found==false)
		{
			this.ResultArray.push(Object);
		}
		//для вывода на экран
		this.processCallback(this.ResultArray);
	}
	var BoundProcessCallBack = this.addToResultArray.bind(this);
	
	this.ContextMenu = new ContextWeightMenu(this.weightArray,this.quantityArray,this.animationCallback,BoundProcessCallBack,this.CONTEXT_MENU_TYPE,this.CONTEXT_MENU_ITEM_TYPE);//Для вызова - initializeMenu = function(product_id) и displayMenuAtCursor = function(cursor_left,cursor_top)
	
	this.WithoutAdditionElement = this.AdditionsMenuRef.childNodes[1];
	for(var i=2;i<this.AdditionsMenuRef.childNodes.length;i++)
	{
		this.Elements.push(this.AdditionsMenuRef.childNodes[i]);
	}
	this.registerEvents();
	
	function createAdditionsMenu(ProductArray,weightArray,DataBaseCallBack)
	{
		//создание общего оборачивающего дива
		var additionalDiv = document.createElement("div");
		additionalDiv.className = "additional";
		//создание дива заголовка
		var additionalHeader = document.createElement("div");
		additionalHeader.className = "additional_header";
		additionalHeader.innerText = "Выберите добавку";
		additionalDiv.appendChild(additionalHeader);
		WithoutAdd = createWithoutAddDiv();
		additionalDiv.appendChild(WithoutAdd);
		Elts = createElementsDivs(ProductArray,weightArray,DataBaseCallBack);
		for(var i=0;i<Elts.length;i++)
		{
			additionalDiv.appendChild(Elts[i]);
		}
		
		function createWithoutAddDiv()
		{
			//создаем оборачивающий тег additional_item_container для первой добавки("без добавки")
			var container1 = document.createElement("div");
			container1.className = "additional_item_container";
			container1.setAttribute("pack-id",-1);
			//заполняем его
			var photo = document.createElement("div");
			photo.className="additional_item_photo";
			photo.innerText="Без добавки";
			container1.appendChild(photo);
			var title = document.createElement("div");
			title.className="additional_item_title";
			title.innerText="Без добавки";
			container1.appendChild(title);
			//additionalDiv.appendChild(container1);
			return container1;
		}
		function createElementsDivs(Product_array,weight_array,DataBase_CallBack)
		{
			var myElements=[];
			Product_array.forEach(function(prod_item,index)
			{
				var ProductDiv = document.createElement("div");
				ProductDiv.className = "additional_item_container";
				ProductDiv.setAttribute("pack-id",prod_item.Id);
				ProductDiv.setAttribute("selected_before",false);//не нажат ранее.
				var checkbox = document.createElement("input");
				checkbox.className = "additional_item_checkbox";
				checkbox.type="checkbox";
				checkbox.checked = "checked";
				checkbox.disabled = true;
				ProductDiv.appendChild(checkbox);
				checkbox.style.display = "none";
				var photo = document.createElement("img");
				photo.className = "additional_item_photo";
				photo.src = prod_item.images_urls[0];
				ProductDiv.appendChild(photo);
				var title = document.createElement("div");
				title.className = "additional_item_title";
				title.innerText = prod_item.name;//название добавки
				ProductDiv.appendChild(title);
				//лейбл с ценой добавки
				var price = document.createElement("div");
				price.className = "additional_item_label_price";
				price.innerText = prod_item.price + " руб. / 100 гр.";
				ProductDiv.appendChild(price);
				//лейбл с мало/много и пр.
				var stockLabel = document.createElement("div");
				//
				var Quantity = prod_item.quantity;
				//запрашиваем зарезервированное кол-во товара
				var ReservedQuantity = DataBase_CallBack(prod_item.Id,"quantity");
				//фактическое количество товара
				var stockQuantity = Quantity - ReservedQuantity;
				//минимальный элемент массива граммажа
				var min_qty = weight_array.reduce(function(min,cur)
				{
					if(cur<min) return cur;
					else return min;
				});
				//получаем максимальный элемент того же массива
				var max_qty = weight_array.reduce(function(max,cur)
				{
					if(cur>max) return cur;
					else return max;
				});
				if((stockQuantity<=0)||(stockQuantity<min_qty))
				{
					//создаем красный маркер - не в наличии
					ProductDiv.setAttribute("in-stock",false);
					var RedAlertTitle = document.createElement("div");
					RedAlertTitle.className = "additional_item_label_notinstock";
					RedAlertTitle.innerText = "НЕТ В НАЛИЧИИ";
					ProductDiv.appendChild(RedAlertTitle);
				}
				else if (stockQuantity<(max_qty*2))
				{
					//создаем желтый маркер - мало
					ProductDiv.setAttribute("in-stock",true);
					var YellowSubMarineTitle = document.createElement("div");
					YellowSubMarineTitle.className = "additional_item_label_less";
					YellowSubMarineTitle.innerText = "МАЛО";
					ProductDiv.appendChild(YellowSubMarineTitle);
				}
				else
				{
					//создаем зеленый маркер - В наличии!!!
					ProductDiv.setAttribute("in-stock",true);
					var GreenPieceTitle = document.createElement("div");
					GreenPieceTitle.className = "additional_item_label_instock";
					GreenPieceTitle.innerText = "В НАЛИЧИИ";
					ProductDiv.appendChild(GreenPieceTitle);
				}
				myElements.push(ProductDiv);
			});
			return myElements;
		}
		return additionalDiv;
	}
}
Additions.prototype.displayButtons = function()
{
	console.log("-><- ^__^ Кнопки НАЗАД и ДАЛЕЕ показаны!!!");
}
Additions.prototype.registerEvents = function()
{
	//регистрируем события для каждого объекта
	//для "Без добавок" сначала
	var thisRef = this;
	this.WithoutAdditionElement.addEventListener("click",function(event)
	{
		event.stopPropagation();
		thisRef.ResultArray=[];
		//отщелкнуть все остальные кнопки
		for(var j=0;j<thisRef.Elements.length;j++)
		{
			thisRef.animationCallback("unchecked",thisRef.Elements[j],thisRef.ITEM_TYPE);
		}
		if(thisRef.fl_buttonsDisplayed==false)
		{
			thisRef.displayButtons();
			thisRef.fl_buttonsDisplayed=true;
		}
		thisRef.processCallback(thisRef.ResultArray);
	});
	var container_className = this.Elements[0].className;
	for(var i=0;i<this.Elements.length;i++)
	{
		this.Elements[i].addEventListener("click",function(event)
		{
			event.stopPropagation();
			var selected_Id;//Id выбранного элемента
			var TARGET;
			if(event.target.className!=container_className)//значит, мы нажали на вложенный элемент, идем вверх по дереву
			{
				var cur=event.target.parentNode;
				while (cur.className!=container_className)
				{
					if(cur.parentNode==null)
					{
						throw new Error("Вышли за пределы документа!!!");
					}
					cur = cur.parentNode;
				}
				//считаем выбранный Id
				TARGET=cur;
			}
			else
			{
				TARGET=event.target;
			}
			if(TARGET.getAttribute("in-stock")=="true")
			{
				selected_Id = TARGET.getAttribute("pack-id");
				thisRef.animationCallback("checked",TARGET,thisRef.ITEM_TYPE);
				//инициализируем и показываем контекстное меню
				thisRef.ContextMenu.initializeMenu(selected_Id);
				thisRef.ContextMenu.displayMenuAtCursor(event.pageX,event.pageY);
			}
			else
			{
				thisRef.animationCallback("ХВАТИТ МЕНЯ НАЖИМАТЬ, МЕНЯ НЕТ ДОМА!!!","БОМЖ->TARGET","ПОДОЗРИТЕЛЬНЫЙ ITEM_TYPE");
			}
			if(thisRef.fl_buttonsDisplayed==false)
			{
				thisRef.displayButtons();
				thisRef.fl_buttonsDisplayed=true;
			}
		});
	}
	
}
Additions.prototype.displayAdditionsMenu = function(ParentDiv)
{
	ParentDiv.appendChild(this.AdditionsMenuRef);

}
