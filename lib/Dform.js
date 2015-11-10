/**
 * Dform - Smart Form
 *
 * Version - 1.0.0
 *
 * Copyright 2015,Dengjialong
 *
 */

/**
 * 构造函数
 * @param  config 配置项
 */
function Dform(config) {

    //初始化配置
    this.config = this.build_config(config);

    //检查配置项是否正确
    if (this.check_config()) {

    	//运行时数据初始化
    	this.runtime = this.build_runtime();

        //表单初始化
        this.init();
    }
}

Dform.prototype.element_input = ['text', 'checkbox', 'password', 'radio', 'hidden', 'file', 'email', 'url', 'number'];

Dform.prototype.special_propty = ['id', 'name', 'label', 'validate', 'error_message'];

Dform.prototype.class_config ={
	BASE:'Dform-base',
	ELEMENT:'Dform-element-container',
	ELEMENT_LABEL:'Dform-element-label',
	ELEMENT_CONTENT:'Dform-element-content',
	ELEMENT_WARN:'Dform-element-warn',
	ELEMENT_INPUT:'Dform-element-input',
	OPRATION_BAR:'Dform-opration',
	OPRATION_SUBMIT:'Dform-opration-submit',
	OPRATION_RESET:'Dform-opration-reset'
}

Dform.prototype.indexOf = function(array, find) {
    var finder = array.join();
    return finder.indexOf(find) >= 0;
}

Dform.prototype.build_config = function(config) {
    //默认配置项
    var _config = {
        //调试开关
        debug: false,
        //自定义样式
        css: null,
        //表单父级容器
        container: null,
        //表单ID
        id: null,
        //提交方式
        submit_method: "post",
        //表单提交地址
        submit_url: null,
        //是否异步提交
        submit_aysnc: true,
        //异步提交回调
        submit_callback: null,
        //表单项配置
        form_config: [],
        //是否异步读取表单项配置文件
        config_aysnc: false,
        //配置文件地址
        config_url: null
    }
    if (config) {
        for (var p in config) {
            _config[p] = config[p];
        }
    }
    return _config;
}

/**
 * 初始化运行时数据
 * @return {[type]} [description]
 */
Dform.prototype.build_runtime = function() {
    var runtime = {
        //表单数据
        form_data:{}
    };

    return runtime;
}

/**
 * 调试函数
 * @param  info [调试信息]
 */
Dform.prototype.debug = function(info) {
    if (this.config.debug) {
        if (info instanceof Object) {
            console.log("Dform【%s】:%o", this.config.id, info);
        } else {
            console.log("Dform【%s】:%s", this.config.id, info);
        }
    }
}

/**
 * 输出错误信息
 * @param info [错误信息]
 */
Dform.prototype.error = function(info) {
    if (this.config.id) {
        if (info instanceof Object) {
            console.error("Dform【%s】:%o", this.config.id, info);
        } else {
            console.error("Dform【%s】:%s", this.config.id, info);
        }
    } else {
        console.error(info);
    }
    if (this.config.on_error && this.config.on_error instanceof Function) {
        this.config.on_error(info);
    }
}

/**
 * 输出警告信息
 * @param  info [警告信息]
 */
Dform.prototype.alert = function(info) {
    if (info instanceof Object) {
        console.warn("Dform【%s】:%o", this.config.id, info);
    } else {
        console.warn("Dform【%s】:%s", this.config.id, info);
    }
    if (this.config.on_alert && this.config.on_alert instanceof Function) {
        this.config.on_alert(info);
    } else {
        alert(info);
    }
}

/**
 * 配置文件校验函数
 */
Dform.prototype.check_config = function() {
    if (!this.config.submit_url) {
        this.error('参数配置错误：submit_url不能为空');
        return false;
    }
    if (this.config.config_aysnc && !this.config.config_url) {
        this.error('参数配置错误：异步读取表单项配置时config_url不能为空');
        return false;
    }
    return true;
}

/**
 * 异步获取表单项配置文件
 * @param  callback 回调函数
 */
Dform.prototype.get_form_config = function(callback) {
    this.async_get(this.config.config_url, {}, function(data) {
        callback(data);
    });
}

/**
 * 初始化函数
 */
Dform.prototype.init = function() {
    if(this.config.css){
    	var css = this.create_css(this.config.css);
    	this.css_ready(css,function(){
    		this.ready();
    	}.bind(this));
    } else {
    	this.ready();
    }
}

Dform.prototype.ready =function(){
	if (!this.config.id) {
        this.config.id = "Dform_" + new Date().getTime() + Math.floor(Math.random() * 100);
    }
	if (this.config.config_aysnc) {
        this.get_form_config(function(data) {
            this.config.form_config = data;
            this.build_form();
        }.bind(this));
    } else {
        this.build_form();
    }
}

/**
 * 生成表单函数
 */
Dform.prototype.build_form = function() {
    var form = document.createElement("form");
    form.id = this.config.id;
    form.className = this.class_config.BASE;
    if (!this.config.submit_aysnc) {
        form.method = this.config.submit_method;
        form.action = this.config.submit_url;
    }
    for (var i = 0; i < this.config.form_config.length; i++) {
        //生成表单项
        form.appendChild(this.fetch_element(this.config.form_config[i]));
    }
    form.appendChild(this.fetch_opration());
    var container = document.getElementById(this.config.container);
    container.appendChild(form);
    this.build_form_data();
}

/**
 * 构建表单提交数据
 * @return {[type]} [description]
 */
Dform.prototype.build_form_data = function(){
	this.debug('build form data');
}

Dform.prototype.get_form_input_id = function (config) {
	var input_id = this.config.id + "_" + config['name'];
	return input_id;
}

Dform.prototype.get_form_input_warn_id = function (config) {
	var input_warn_id = this.config.id + "_" + config['name'] + "_warn";
	return input_warn_id;
}

/**
 * 渲染表单项
 * @param  element_config 表单项配置
 */
Dform.prototype.fetch_element = function(config) {
    //表单元素容器
    var section = document.createElement("section");
    //表单元素，可以是DOM,String
    var element = null;
    if (this.config.on_element_fech && this.config.on_element_fech instanceof Function) {
        element = this.config.on_element_fech(config);
    } else {
        if (this.indexOf(this.element_input, config.type)) {
            element = this.fetch_input_default(config);
        }
    }
    if (element instanceof Node) {
        section.appendChild(element);
    } else if (typeof(element) == "string") {
        section.innerHTML = element;
    }
    return section;
}

/**
 * 默认input构建函数
 * config 元素配置
 */
Dform.prototype.fetch_input_default = function(config) {

    var div_container = document.createElement("div");
    div_container.className = this.class_config.ELEMENT;

    var div_left = document.createElement("div");
    div_left.className = this.class_config.ELEMENT_LABEL;

    var div_right = document.createElement("div");
    div_right.className = this.class_config.ELEMENT_CONTENT;

	var div_warn = document.createElement("div");
	div_warn.id = this.get_form_input_warn_id(config);  
    div_warn.className = this.class_config.ELEMENT_WARN;
    div_warn.innerText = config['error_message']

    var label = document.createElement("label");
    label.setAttribute("for", config['name']);
    label.innerText = config['label'] + ":";

    div_left.appendChild(label);


	var input = document.createElement("input");
    input.id = this.get_form_input_id(config);   
    input.name = config['name'];
    input.className = this.class_config.ELEMENT_INPUT;

    for (var p in config) {
        if (!this.indexOf(this.special_propty, p)) {
            input.setAttribute(p, config[p]);
        }
    }

    div_right.appendChild(input);

    div_container.appendChild(div_left);
    div_container.appendChild(div_right);
    div_container.appendChild(div_warn);
    return div_container;
}

/**
 * 渲染提交区域
 */
Dform.prototype.fetch_opration = function() {
    var section = document.createElement("section");

    var div_opration = document.createElement("div");
    div_opration.className = this.class_config.OPRATION_BAR;

    var btn_submit = document.createElement("input");
    btn_submit.type = 'button';
    btn_submit.value = '提交';
    btn_submit.className = this.class_config.OPRATION_SUBMIT;

    var btn_reset = document.createElement("input");
    btn_reset.type = 'button';
    btn_reset.value = '重置';
    btn_reset.className = this.class_config.OPRATION_RESET;

    div_opration.appendChild(btn_submit);
    div_opration.appendChild(btn_reset);

    btn_submit.addEventListener("click", this.form_submit.bind(this));
    btn_reset.addEventListener("click", this.form_reset.bind(this));

    section.appendChild(div_opration);
    return section;
}

Dform.prototype.input_focus = function(){

}

Dform.prototype.input_blur = function(){

}

Dform.prototype.input_keyup = function(){
	
}

/**
 * 表单提交
 */
Dform.prototype.form_submit = function() {
    this.debug('表单提交');
    if (this.config.submit_aysnc) {
    	var form_data = this.runtime.form_data;
    	var form_validate = true;
    	for(var i=0;i<this.config.form_config.length;i++){
    		if(!this.form_submit_validate(this.config.form_config[i])){
    			form_validate =  false;
    		}
    	}
    	if (this.config.on_submit && this.config.on_submit instanceof Function) {
			if(!this.config.on_submit(this.runtime.form_data)){
				form_validate = false;
			}
		}
		if(form_validate){
			this.async_post(this.config.submit_url,this.build_form_data(),this.config.submit_callback);
		}
    } else {
        var form = document.getElementById(this.config.id);
        form.submit();
    }
}

/**
 * 表单重置
 */
Dform.prototype.form_reset = function() {
    this.debug('表单重置');
    if (this.config.on_reset && this.config.on_reset instanceof Function) {
        this.config.on_reset(this);
    }
}

Dform.prototype.form_submit_validate = function (config) {
	var input=document.getElementById(this.get_form_input_id(config));
	var div_warn = document.getElementById(this.get_form_input_warn_id(config));
	if(config.required && !input.value){
		div_warn.style.display = "block";
		return false;
	} else {
		div_warn.style.display = "none";
	}
	return true;
}

/**
 * 异步get
 * @param  url      [请求链接]
 * @param  data     [请求数据]
 * @param  callback [回调函数]
 */
Dform.prototype.async_get = function(url, data, callback) {
    var AjaxRequest = new XMLHttpRequest();
    if (!AjaxRequest) {
        this.error("Ajax请求初始化失败!");
        return false;
    }　
    AjaxRequest.responseType = 'json';
    AjaxRequest.onreadystatechange = function() {
        switch (AjaxRequest.readyState) {
            case 1:
                this.debug('ajax打开，准备上传');
                break;
            case 4:
                if (AjaxRequest.status == 200) {
                    this.debug('ajax 收到服务器端数据');
                    this.debug(AjaxRequest.response);
                    if (!AjaxRequest.response) {
                        this.error('ajax返回格式错误');
                    } else {
                        callback(AjaxRequest.response);
                    }
                } else {
                    this.error("上传过程出现错误,状态:" + AjaxRequest.status);
                }
                break;
        }
    }.bind(this);
    AjaxRequest.error = function() {
        this.error("提交过程出现错误");
    }.bind(this);
    url += "?time=" + new Date().getTime();
    for (var p in data) {
        url += "&" + p + "=" + data[p];
    }
    AjaxRequest.open('GET', url, true);　
    AjaxRequest.send(null);
}

/**
 * 异步post
 * @param  url      [请求链接]
 * @param  data     [请求数据]
 * @param  callback [回调函数]
 */
Dform.prototype.async_post = function(url, data, callback) {
    this.debug(data);
    var AjaxRequest = new XMLHttpRequest();
    if (!AjaxRequest) {
        this.error("Ajax请求初始化失败!");
        return false;
    }　
    AjaxRequest.responseType = 'json';
    AjaxRequest.onreadystatechange = function() {
        switch (AjaxRequest.readyState) {
            case 1:
                this.debug('ajax打开，准备上传');
                break;
            case 4:
                if (AjaxRequest.status == 200) {
                    this.debug('ajax 收到服务器端数据');
                    callback(AjaxRequest.response);
                } else {
                    this.error("上传过程出现错误,状态:" + AjaxRequest.status);
                }
                break;
        }
    }.bind(this);
    AjaxRequest.error = function() {
        this.error("提交过程出现错误");
    }.bind(this);
    var UploadForm = new FormData();
    if (UploadForm) {
        for (var p in data) {
            UploadForm.append(p, data[p]);
        }
        AjaxRequest.open('POST', url, true);　
        AjaxRequest.send(UploadForm);
    } else {
        this.error("提交过程出现错误");
    }
}

/**
 * 添加css头
 * @param  url [css链接地址]
 */
Dform.prototype.create_css = function(url) {
	var head = document.getElementsByTagName('head')[0];
	var linkTag = document.createElement('link');
	linkTag.setAttribute('rel','stylesheet');
	linkTag.setAttribute('type','text/css');
	linkTag.href = url; 
    head.appendChild(linkTag); 
    return linkTag;
}

/**
 * css加载判断
 * @param  link     [css链接]
 * @param  callback [回调函数]
 */
Dform.prototype.css_ready = function cssReady(link,callback) {
    var d = document,
        t = d.createStyleSheet,
        r = t ? 'rules' : 'cssRules',
        s = t ? 'styleSheet' : 'sheet',
        l = d.getElementsByTagName('link');
    // passed link or last link node
    link || (link = l[l.length - 1]);

    function check() {
        try {
            return link && link[s] && link[s][r] && link[s][r][0];
        } catch (e) {
            return false;
        }
    }

	(function poll() {
	    check() && setTimeout(callback, 0) || setTimeout(poll, 100);
	})();
}
