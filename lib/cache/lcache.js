/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
/*
  (C) 2011-2012 Alibaba Group Holding Limited.
  This program is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License 
  version 2 as published by the Free Software Foundation.

  File: lcache.js
  Author: yixuan (yixuan.zzq@taobao.com)
  Description: 本地缓存类
  Last Modified: 2012-02-07
*/

//缓存答应到日志里的间隔时间
var printLengthInterval = 5*60*1000;

/*{{{ LCache constructor*/
/**
 * LCache构造函数
 * @param {int} size 缓存容量
 * @return void
 */
var LCache = function(size){
  this.buffer = [];
  this.size = size;
  var _self = this;
  setInterval(function(){
    workerLogger.notice("LcacheLength","Lcache Length:" + _self.buffer.length + "|pid:" + process.pid);
  },printLengthInterval);
}
/*}}}*/

/*{{{ get()*/
/**
 * 读取缓存
 * @param {String} key 缓存键
 * @return {Object}
 */
LCache.prototype.get = function(key){
  var buf = this.buffer;
  var len = buf.length;
  var res = false;
  var tmp;
  for(var i = 0; i < len; i++){
    if(buf[i].key == key){
      res = objectClone(buf[i].value);
      if(i !=  0){
        tmp = buf[i-1];
        buf[i-1] = buf[i];
        buf[i] = tmp;
      }
      break;
    }
  }
  return res;
}
/*}}}*/

/*{{{ set()*/
/**
 * 设置缓存
 * @param {String} key 缓存键
 * @param {String} value 缓存值
 * @return void
 */
LCache.prototype.set = function(key,value){
  if(this.buffer.length == this.size){
    this.buffer.pop();
  }
  this.buffer.push({"key":key,"value":value});
}
/*}}}*/

/*{{{ clean()*/
/**
 * 清空缓存
 * @param empty
 * @return void
 */
LCache.prototype.clean = function(){
  workerLogger.warning("before_clean_lcache","lcache length:" + this.buffer.length + "|pid:" + process.pid);
  while(this.buffer.length > 0){
    this.buffer.pop();
  }
  workerLogger.warning("after_clean_lcache","lcache length:" + this.buffer.length + "|pid:" + process.pid);
}
/*}}}*/

/*{{{ create()*/
/**
 * 创建缓存对象
 * @param {int} size 缓存容量
 * @return {Object} 缓存对象
 */
exports.create = function(size){
  return new LCache(size);
}
/*}}}*/

/*{{{ objectClone()*/
/**
 * 对象复制
 * @param {Object} obj 需要复制的对象
 * @param {String} preventName屏蔽复制的元素
 * @return {Object}
 */
function objectClone(obj,preventName){
  if((typeof obj)=='object' && obj !== null){
    var res=(!obj.sort)?{}:[];
    for(var i in obj){
      if(i!=preventName)
        res[i]=objectClone(obj[i],preventName);
    }
    return res;
  }else if((typeof obj)=='function'){
    return (new obj()).constructor;
  }
  return obj;
}
/*}}}*/