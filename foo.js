
var fs = require('fs');
var recur = require('recursive-readdir');
var async = require('async');
var metamd = require('metamd');

function get_files (path, cb) {
    fs.exists(path, function(exists) {
        if(!exists) {
            return cb(new Error("Path '"+path+"' does not exist"));
        }
        recur(path, cb);
    });
}

var Scatter = function(opts){
    var self = this;

    self.content   = opts.content_path  || './content';
    self.templates = opts.template_path || './templates';
}

Scatter.prototype.content_files = function (cb){
    var self = this;
    get_files(self.content, cb);
}

Scatter.prototype.template_files = function (cb){
    var self = this;
    get_files(self.templates, cb);
}

function get_content_item (file, cb) {
    fs.readFile(file, 'utf-8', function(err, data) {
        if (err) cb(err);
        var parsed = metamd.parse(data);
        var content = metamd.render(parsed.body);
        delete parsed['body'];
        var content_item = new ContentItem({ 
            metadata: parsed, 
            content: content,
            path: file
        });
        cb(null, content_item); 
    });
}

Scatter.prototype.get_content_items = function(cb){
    var self = this;
    get_files(self.content, function(err, files){
        async.map(files, get_content_item,
            function(err, results) {
                cb(err, results);
            }
        );
    }); 
}

var foo = new Scatter ({ content_path: 'test/content', template_path: 'test/templates' });

foo.content_files(function(err, files){
    console.dir(files);
});

foo.template_files(function(err, files){
    console.dir(files);
});

foo.get_content_items(function(err, items){
    console.dir(items);
});

var ContentItem = function(opts){
    var self = this;

    self.metadata = opts.metadata || {};
    self.content = opts.content || '';
    self.templates = opts.templates || [];
    self.path = opts.path;
};

