!function(e) {
    "object" == typeof exports ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : "undefined" != typeof window ? window.PouchDB = e() : "undefined" != typeof global ? global.PouchDB = e() : "undefined" != typeof self && (self.PouchDB = e())
}(function() {
    var define, module, exports;
    return function e(t, n, r) {
        function o(a, s) {
            if (!n[a]) {
                if (!t[a]) {
                    var u = "function" == typeof require && require;
                    if (!s && u)
                        return u(a, !0);
                    if (i)
                        return i(a, !0);
                    throw new Error("Cannot find module '" + a + "'")
                }
                var c = n[a] = {exports: {}};
                t[a][0].call(c.exports, function(e) {
                    var n = t[a][1][e];
                    return o(n ? n : e)
                }, c, c.exports, e, t, n, r)
            }
            return n[a].exports
        }
        for (var i = "function" == typeof require && require, a = 0; a < r.length; a++)
            o(r[a]);
        return o
    }({1: [function(require, module, exports) {
                "use strict";
                function arrayFirst(e, t) {
                    for (var n = 0; n < e.length; n++)
                        if (t(e[n], n) === !0)
                            return e[n];
                    return!1
                }
                function yankError(e) {
                    return function(t, n) {
                        t || n[0].error ? call(e, t || n[0]) : call(e, null, n[0])
                    }
                }
                function computeHeight(e) {
                    var t = {}, n = [];
                    return merge.traverseRevTree(e, function(e, r, o, i) {
                        var a = r + "-" + o;
                        return e && (t[a] = 0), void 0 !== i && n.push({from: i, to: a}), a
                    }), n.reverse(), n.forEach(function(e) {
                        t[e.from] = void 0 === t[e.from] ? 1 + t[e.to] : Math.min(t[e.from], 1 + t[e.to])
                    }), t
                }
                var utils = require("./utils"), merge = require("./merge"), errors = require("./deps/errors"), call = utils.call;
                module.exports = function(Pouch) {
                    return function(opts, callback) {
                        function autoCompact(e) {
                            return auto_compaction ? function(t, n) {
                                if (t)
                                    call(e, t);
                                else {
                                    var r = n.length, o = function() {
                                        r--, r || call(e, null, n)
                                    };
                                    n.forEach(function(e) {
                                        e.ok ? compactDocument(e.id, 1, o) : o()
                                    })
                                }
                            } : e
                        }
                        function compactDocument(e, t, n) {
                            customApi._getRevisionTree(e, function(r, o) {
                                if (r)
                                    return call(n);
                                var i = computeHeight(o), a = [], s = [];
                                Object.keys(i).forEach(function(e) {
                                    i[e] > t && a.push(e)
                                }), merge.traverseRevTree(o, function(e, t, n, r, o) {
                                    var i = t + "-" + n;
                                    "available" === o.status && -1 !== a.indexOf(i) && (o.status = "missing", s.push(i))
                                }), customApi._doCompaction(e, o, s, n)
                            })
                        }
                        var api = {}, customApi = Pouch.adapters[opts.adapter](opts, function(e, t) {
                            if (e)
                                return callback && callback(e), void 0;
                            for (var n in api)
                                t.hasOwnProperty(n) || (t[n] = api[n]);
                            opts.name === Pouch.prefix + Pouch.ALL_DBS ? callback(e, t) : Pouch.open(opts, function(e) {
                                callback(e, t)
                            })
                        }), auto_compaction = opts.auto_compaction === !0;
                        api.post = function(e, t, n) {
                            return"function" == typeof t && (n = t, t = {}), "object" != typeof e || Array.isArray(e) ? call(n, errors.NOT_AN_OBJECT) : customApi.bulkDocs({docs: [e]}, t, autoCompact(yankError(n)))
                        }, api.put = function(e, t, n) {
                            return"function" == typeof t && (n = t, t = {}), "object" != typeof e ? call(n, errors.NOT_AN_OBJECT) : "_id"in e ? customApi.bulkDocs({docs: [e]}, t, autoCompact(yankError(n))) : call(n, errors.MISSING_ID)
                        }, api.putAttachment = function(e, t, n, r, o, i) {
                            function a(e) {
                                e._attachments = e._attachments || {}, e._attachments[t] = {content_type: o, data: r}, api.put(e, i)
                            }
                            return api.taskqueue.ready() ? ("function" == typeof o && (i = o, o = r, r = n, n = null), "undefined" == typeof o && (o = r, r = n, n = null), api.get(e, function(t, r) {
                                return t && t.error === errors.MISSING_DOC.error ? (a({_id: e}), void 0) : t ? (call(i, t), void 0) : r._rev !== n ? (call(i, errors.REV_CONFLICT), void 0) : (a(r), void 0)
                            }), void 0) : (api.taskqueue.addTask("putAttachment", arguments), void 0)
                        }, api.removeAttachment = function(e, t, n, r) {
                            api.get(e, function(e, o) {
                                return e ? (call(r, e), void 0) : o._rev !== n ? (call(r, errors.REV_CONFLICT), void 0) : o._attachments ? (delete o._attachments[t], 0 === Object.keys(o._attachments).length && delete o._attachments, api.put(o, r), void 0) : call(r, null)
                            })
                        }, api.remove = function(e, t, n) {
                            "function" == typeof t && (n = t, t = {}), void 0 === t && (t = {}), t.was_delete = !0;
                            var r = {_id: e._id, _rev: e._rev};
                            return r._deleted = !0, customApi.bulkDocs({docs: [r]}, t, yankError(n))
                        }, api.revsDiff = function(e, t, n) {
                            function r(e, t) {
                                s[e] || (s[e] = {missing: []}), s[e].missing.push(t)
                            }
                            function o(t, n) {
                                var o = e[t].slice(0);
                                merge.traverseRevTree(n, function(e, n, i, a, s) {
                                    var u = n + "-" + i, c = o.indexOf(u);
                                    -1 !== c && (o.splice(c, 1), "available" !== s.status && r(t, u))
                                }), o.forEach(function(e) {
                                    r(t, e)
                                })
                            }
                            "function" == typeof t && (n = t, t = {});
                            var i = Object.keys(e), a = 0, s = {};
                            i.map(function(t) {
                                customApi._getRevisionTree(t, function(r, u) {
                                    if (r && "not_found" === r.error && "missing" === r.reason)
                                        s[t] = {missing: e[t]};
                                    else {
                                        if (r)
                                            return call(n, r);
                                        o(t, u)
                                    }
                                    return++a === i.length ? call(n, null, s) : void 0
                                })
                            })
                        }, api.compact = function(e, t) {
                            "function" == typeof e && (t = e, e = {}), api.changes({complete: function(e, n) {
                                    if (e)
                                        return call(t), void 0;
                                    var r = n.results.length;
                                    return r ? (n.results.forEach(function(e) {
                                        compactDocument(e.id, 0, function() {
                                            r--, r || call(t)
                                        })
                                    }), void 0) : (call(t), void 0)
                                }})
                        }, api.get = function(e, t, n) {
                            function r() {
                                var r = [], i = o.length;
                                return i ? (o.forEach(function(o) {
                                    api.get(e, {rev: o, revs: t.revs}, function(e, t) {
                                        e ? r.push({missing: o}) : r.push({ok: t}), i--, i || call(n, null, r)
                                    })
                                }), void 0) : call(n, null, r)
                            }
                            if (!api.taskqueue.ready())
                                return api.taskqueue.addTask("get", arguments), void 0;
                            "function" == typeof t && (n = t, t = {});
                            var o = [];
                            {
                                if (!t.open_revs)
                                    return customApi._get(e, t, function(e, r) {
                                        if (e)
                                            return call(n, e);
                                        var o = r.doc, i = r.metadata, a = r.ctx;
                                        if (t.conflicts) {
                                            var s = merge.collectConflicts(i);
                                            s.length && (o._conflicts = s)
                                        }
                                        if (t.revs || t.revs_info) {
                                            var u = merge.rootToLeaf(i.rev_tree), c = arrayFirst(u, function(e) {
                                                return-1 !== e.ids.map(function(e) {
                                                    return e.id
                                                }).indexOf(o._rev.split("-")[1])
                                            });
                                            if (c.ids.splice(c.ids.map(function(e) {
                                                return e.id
                                            }).indexOf(o._rev.split("-")[1]) + 1), c.ids.reverse(), t.revs && (o._revisions = {start: c.pos + c.ids.length - 1, ids: c.ids.map(function(e) {
                                                    return e.id
                                                })}), t.revs_info) {
                                                var d = c.pos + c.ids.length;
                                                o._revs_info = c.ids.map(function(e) {
                                                    return d--, {rev: d + "-" + e.id, status: e.opts.status}
                                                })
                                            }
                                        }
                                        if (t.local_seq && (o._local_seq = r.metadata.seq), t.attachments && o._attachments) {
                                            var l = o._attachments, f = Object.keys(l).length;
                                            if (0 === f)
                                                return call(n, null, o);
                                            Object.keys(l).forEach(function(e) {
                                                customApi._getAttachment(l[e], {encode: !0, ctx: a}, function(t, r) {
                                                    o._attachments[e].data = r, --f || call(n, null, o)
                                                })
                                            })
                                        } else {
                                            if (o._attachments)
                                                for (var p in o._attachments)
                                                    o._attachments[p].stub = !0;
                                            call(n, null, o)
                                        }
                                    });
                                if ("all" === t.open_revs)
                                    customApi._getRevisionTree(e, function(e, t) {
                                        e && (t = []), o = merge.collectLeaves(t).map(function(e) {
                                            return e.rev
                                        }), r()
                                    });
                                else {
                                    if (!Array.isArray(t.open_revs))
                                        return call(n, utils.error(errors.UNKNOWN_ERROR, "function_clause"));
                                    o = t.open_revs;
                                    for (var i = 0; i < o.length; i++) {
                                        var a = o[i];
                                        if ("string" != typeof a || !/^\d+-/.test(a))
                                            return call(n, utils.error(errors.BAD_REQUEST, "Invalid rev format"))
                                    }
                                    r()
                                }
                            }
                        }, api.getAttachment = function(e, t, n, r) {
                            return api.taskqueue.ready() ? (n instanceof Function && (r = n, n = {}), customApi._get(e, n, function(e, o) {
                                return e ? call(r, e) : o.doc._attachments && o.doc._attachments[t] ? (n.ctx = o.ctx, customApi._getAttachment(o.doc._attachments[t], n, r), void 0) : call(r, errors.MISSING_DOC)
                            }), void 0) : (api.taskqueue.addTask("getAttachment", arguments), void 0)
                        }, api.allDocs = function(e, t) {
                            if (!api.taskqueue.ready())
                                return api.taskqueue.addTask("allDocs", arguments), void 0;
                            if ("function" == typeof e && (t = e, e = {}), "keys"in e) {
                                if ("startkey"in e)
                                    return call(t, utils.error(errors.QUERY_PARSE_ERROR, "Query parameter `start_key` is not compatible with multi-get")), void 0;
                                if ("endkey"in e)
                                    return call(t, utils.error(errors.QUERY_PARSE_ERROR, "Query parameter `end_key` is not compatible with multi-get")), void 0
                            }
                            return"undefined" == typeof e.skip && (e.skip = 0), customApi._allDocs(e, t)
                        }, api.changes = function(opts) {
                            if (!api.taskqueue.ready()) {
                                var task = api.taskqueue.addTask("changes", arguments);
                                return{cancel: function() {
                                        return task.task ? task.task.cancel() : (Pouch.DEBUG, task.parameters[0].aborted = !0, void 0)
                                    }}
                            }
                            if (opts = utils.extend(!0, {}, opts), opts.since || (opts.since = 0), "latest" === opts.since) {
                                var changes;
                                return api.info(function(e, t) {
                                    opts.aborted || (opts.since = t.update_seq - 1, api.changes(opts))
                                }), {cancel: function() {
                                        return changes ? changes.cancel() : (Pouch.DEBUG, opts.aborted = !0, void 0)
                                    }}
                            }
                            if (opts.filter && "string" == typeof opts.filter) {
                                if ("_view" === opts.filter)
                                    if (opts.view && "string" == typeof opts.view) {
                                        var viewName = opts.view.split("/");
                                        api.get("_design/" + viewName[0], function(err, ddoc) {
                                            if (ddoc && ddoc.views && ddoc.views[viewName[1]]) {
                                                var filter = eval("(function () {  return function (doc) {    var emitted = false;    var emit = function (a, b) {      emitted = true;    };    var view = " + ddoc.views[viewName[1]].map + ";    view(doc);    if (emitted) {      return true;    }  }})()");
                                                opts.aborted || (opts.filter = filter, api.changes(opts))
                                            } else {
                                                var msg = ddoc.views ? "missing json key: " + viewName[1] : "missing json key: views";
                                                err = err || utils.error(errors.MISSING_DOC, msg), utils.call(opts.complete, err)
                                            }
                                        })
                                    } else {
                                        var err = utils.error(errors.BAD_REQUEST, "`view` filter parameter is not provided.");
                                        utils.call(opts.complete, err)
                                    }
                                else {
                                    var filterName = opts.filter.split("/");
                                    api.get("_design/" + filterName[0], function(err, ddoc) {
                                        if (ddoc && ddoc.filters && ddoc.filters[filterName[1]]) {
                                            var filter = eval("(function () { return " + ddoc.filters[filterName[1]] + " })()");
                                            opts.aborted || (opts.filter = filter, api.changes(opts))
                                        } else {
                                            var msg = ddoc && ddoc.filters ? "missing json key: " + filterName[1] : "missing json key: filters";
                                            err = err || utils.error(errors.MISSING_DOC, msg), utils.call(opts.complete, err)
                                        }
                                    })
                                }
                                return{cancel: function() {
                                        Pouch.DEBUG && console.log("Cancel Changes Feed"), opts.aborted = !0
                                    }}
                            }
                            return"descending"in opts || (opts.descending = !1), opts.limit = 0 === opts.limit ? 1 : opts.limit, customApi._changes(opts)
                        }, api.close = function(e) {
                            return api.taskqueue.ready() ? customApi._close(e) : (api.taskqueue.addTask("close", arguments), void 0)
                        }, api.info = function(e) {
                            return api.taskqueue.ready() ? customApi._info(e) : (api.taskqueue.addTask("info", arguments), void 0)
                        }, api.id = function() {
                            return customApi._id()
                        }, api.type = function() {
                            return"function" == typeof customApi._type ? customApi._type() : opts.adapter
                        }, api.bulkDocs = function(e, t, n) {
                            if (!api.taskqueue.ready())
                                return api.taskqueue.addTask("bulkDocs", arguments), void 0;
                            if ("function" == typeof t && (n = t, t = {}), t = t ? utils.extend(!0, {}, t) : {}, !e || !e.docs || e.docs.length < 1)
                                return call(n, errors.MISSING_BULK_DOCS);
                            if (!Array.isArray(e.docs))
                                return call(n, errors.QUERY_PARSE_ERROR);
                            for (var r = 0; r < e.docs.length; ++r)
                                if ("object" != typeof e.docs[r] || Array.isArray(e.docs[r]))
                                    return call(n, errors.NOT_AN_OBJECT);
                            return e = utils.extend(!0, {}, e), "new_edits"in t || (t.new_edits = !0), customApi._bulkDocs(e, t, autoCompact(n))
                        };
                        var taskqueue = {};
                        taskqueue.ready = !1, taskqueue.queue = [], api.taskqueue = {}, api.taskqueue.execute = function(e) {
                            taskqueue.ready && taskqueue.queue.forEach(function(t) {
                                t.task = e[t.name].apply(null, t.parameters)
                            })
                        }, api.taskqueue.ready = function() {
                            return 0 === arguments.length ? taskqueue.ready : (taskqueue.ready = arguments[0], void 0)
                        }, api.taskqueue.addTask = function(e, t) {
                            var n = {name: e, parameters: t};
                            return taskqueue.queue.push(n), n
                        }, api.replicate = {}, api.replicate.from = function(e, t, n) {
                            return"function" == typeof t && (n = t, t = {}), Pouch.replicate(e, customApi, t, n)
                        }, api.replicate.to = function(e, t, n) {
                            return"function" == typeof t && (n = t, t = {}), Pouch.replicate(customApi, e, t, n)
                        };
                        for (var j in api)
                            customApi.hasOwnProperty(j) || (customApi[j] = api[j]);
                        return opts.skipSetup && (api.taskqueue.ready(!0), api.taskqueue.execute(api)), utils.isCordova() && cordova.fireWindowEvent(opts.name + "_pouch", {}), customApi
                    }
                }
            }, {"./deps/errors": 7, "./merge": 12, "./utils": 14}], 2: [function(e, t) {
                "use strict";
                function n(e) {
                    for (var t = n.options, r = t.parser[t.strictMode ? "strict" : "loose"].exec(e), o = {}, i = 14; i--; )
                        o[t.key[i]] = r[i] || "";
                    return o[t.q.name] = {}, o[t.key[12]].replace(t.q.parser, function(e, n, r) {
                        n && (o[t.q.name][n] = r)
                    }), o
                }
                function r(e) {
                    return/^_(design|local)/.test(e) ? e : encodeURIComponent(e)
                }
                function o(e, t) {
                    if (/http(s?):/.test(e)) {
                        var r = n(e);
                        r.remote = !0, (r.user || r.password) && (r.auth = {username: r.user, password: r.password});
                        var o = r.path.replace(/(^\/|\/$)/g, "").split("/");
                        if (r.db = o.pop(), r.path = o.join("/"), t = t || {}, r.headers = t.headers || {}, t.auth || r.auth) {
                            var i = t.auth || r.auth, a = u.btoa(i.username + ":" + i.password);
                            r.headers.Authorization = "Basic " + a
                        }
                        return t.headers && (r.headers = t.headers), r
                    }
                    return{host: "", path: "/", db: e, auth: !1}
                }
                function i(e, t) {
                    if (e.remote) {
                        var n = e.path ? "/" : "";
                        return e.protocol + "://" + e.host + ":" + e.port + "/" + e.path + n + e.db + "/" + t
                    }
                    return"/" + e.db + "/" + t
                }
                function a(e, t) {
                    if (e.remote) {
                        var n = e.path ? "/" : "";
                        return e.protocol + "://" + e.host + ":" + e.port + "/" + e.path + n + t
                    }
                    return"/" + t
                }
                function s(e, t) {
                    function n(e, t) {
                        return u.ajax(u.extend({}, f, e), t)
                    }
                    var s = o(e.name, e), d = i(s, ""), l = {}, f = e.ajax || {}, p = {list: [], get: function(e, t) {
                            "function" == typeof e && (t = e, e = {count: 10});
                            var r = function(e, n) {
                                !e && "uuids"in n ? (p.list = p.list.concat(n.uuids), u.call(t, null, "OK")) : u.call(t, e || c.UNKNOWN_ERROR)
                            }, o = "?count=" + e.count;
                            n({headers: s.headers, method: "GET", url: a(s, "_uuids") + o}, r)
                        }}, v = function() {
                        n({headers: s.headers, method: "PUT", url: d}, function(e) {
                            e && 401 === e.status ? n({headers: s.headers, method: "HEAD", url: d}, function(e) {
                                e ? u.call(t, e) : u.call(t, null, l)
                            }) : e && 412 !== e.status ? u.call(t, c.UNKNOWN_ERROR) : u.call(t, null, l)
                        })
                    };
                    return e.skipSetup || n({headers: s.headers, method: "GET", url: d}, function(e) {
                        e ? 404 === e.status ? v() : u.call(t, e) : u.call(t, null, l)
                    }), l.type = function() {
                        return"http"
                    }, l.id = function() {
                        return i(s, "")
                    }, l.request = function(e, t) {
                        return l.taskqueue.ready() ? (e.headers = s.headers, e.url = i(s, e.url), n(e, t), void 0) : (l.taskqueue.addTask("request", arguments), void 0)
                    }, l.compact = function(e, t) {
                        return l.taskqueue.ready() ? ("function" == typeof e && (t = e, e = {}), n({headers: s.headers, url: i(s, "_compact"), method: "POST"}, function() {
                            function n() {
                                l.info(function(r, o) {
                                    o.compact_running ? setTimeout(n, e.interval || 200) : u.call(t, null)
                                })
                            }
                            "function" == typeof t && n()
                        }), void 0) : (l.taskqueue.addTask("compact", arguments), void 0)
                    }, l.info = function(e) {
                        return l.taskqueue.ready() ? (n({headers: s.headers, method: "GET", url: i(s, "")}, e), void 0) : (l.taskqueue.addTask("info", arguments), void 0)
                    }, l.get = function(e, t, o) {
                        if (!l.taskqueue.ready())
                            return l.taskqueue.addTask("get", arguments), void 0;
                        "function" == typeof t && (o = t, t = {}), void 0 === t.auto_encode && (t.auto_encode = !0);
                        var a = [];
                        t.revs && a.push("revs=true"), t.revs_info && a.push("revs_info=true"), t.local_seq && a.push("local_seq=true"), t.open_revs && ("all" !== t.open_revs && (t.open_revs = JSON.stringify(t.open_revs)), a.push("open_revs=" + t.open_revs)), t.attachments && a.push("attachments=true"), t.rev && a.push("rev=" + t.rev), t.conflicts && a.push("conflicts=" + t.conflicts), a = a.join("&"), a = "" === a ? "" : "?" + a, t.auto_encode && (e = r(e));
                        var c = {headers: s.headers, method: "GET", url: i(s, e + a)}, d = e.split("/");
                        (d.length > 1 && "_design" !== d[0] && "_local" !== d[0] || d.length > 2 && "_design" === d[0] && "_local" !== d[0]) && (c.binary = !0), n(c, function(e, t, n) {
                            return e ? u.call(o, e) : (u.call(o, null, t, n), void 0)
                        })
                    }, l.remove = function(e, t, o) {
                        return l.taskqueue.ready() ? ("function" == typeof t && (o = t, t = {}), n({headers: s.headers, method: "DELETE", url: i(s, r(e._id)) + "?rev=" + e._rev}, o), void 0) : (l.taskqueue.addTask("remove", arguments), void 0)
                    }, l.getAttachment = function(e, t, n, o) {
                        "function" == typeof n && (o = n, n = {}), void 0 === n.auto_encode && (n.auto_encode = !0), n.auto_encode && (e = r(e)), n.auto_encode = !1, l.get(e + "/" + t, n, o)
                    }, l.removeAttachment = function(e, t, o, a) {
                        return l.taskqueue.ready() ? (n({headers: s.headers, method: "DELETE", url: i(s, r(e) + "/" + t) + "?rev=" + o}, a), void 0) : (l.taskqueue.addTask("removeAttachment", arguments), void 0)
                    }, l.putAttachment = function(e, t, o, a, u, c) {
                        if (!l.taskqueue.ready())
                            return l.taskqueue.addTask("putAttachment", arguments), void 0;
                        "function" == typeof u && (c = u, u = a, a = o, o = null), "undefined" == typeof u && (u = a, a = o, o = null);
                        var d = r(e) + "/" + t, f = i(s, d);
                        o && (f += "?rev=" + o);
                        var p = {headers: s.headers, method: "PUT", url: f, processData: !1, body: a, timeout: 6e4};
                        p.headers["Content-Type"] = u, n(p, c)
                    }, l.put = function(e, t, o) {
                        if (!l.taskqueue.ready())
                            return l.taskqueue.addTask("put", arguments), void 0;
                        if ("function" == typeof t && (o = t, t = {}), "object" != typeof e)
                            return u.call(o, c.NOT_AN_OBJECT);
                        if (!("_id"in e))
                            return u.call(o, c.MISSING_ID);
                        var a = [];
                        t && "undefined" != typeof t.new_edits && a.push("new_edits=" + t.new_edits), a = a.join("&"), "" !== a && (a = "?" + a), n({headers: s.headers, method: "PUT", url: i(s, r(e._id)) + a, body: e}, o)
                    }, l.post = function(e, t, n) {
                        return l.taskqueue.ready() ? ("function" == typeof t && (n = t, t = {}), "object" != typeof e ? u.call(n, c.NOT_AN_OBJECT) : ("_id"in e ? l.put(e, t, n) : p.list.length > 0 ? (e._id = p.list.pop(), l.put(e, t, n)) : p.get(function(r) {
                            return r ? u.call(n, c.UNKNOWN_ERROR) : (e._id = p.list.pop(), l.put(e, t, n), void 0)
                        }), void 0)) : (l.taskqueue.addTask("post", arguments), void 0)
                    }, l.bulkDocs = function(e, t, r) {
                        return l.taskqueue.ready() ? ("function" == typeof t && (r = t, t = {}), t || (t = {}), "undefined" != typeof t.new_edits && (e.new_edits = t.new_edits), n({headers: s.headers, method: "POST", url: i(s, "_bulk_docs"), body: e}, r), void 0) : (l.taskqueue.addTask("bulkDocs", arguments), void 0)
                    }, l.allDocs = function(e, t) {
                        if (!l.taskqueue.ready())
                            return l.taskqueue.addTask("allDocs", arguments), void 0;
                        "function" == typeof e && (t = e, e = {});
                        var r, o = [], a = "GET";
                        e.conflicts && o.push("conflicts=true"), e.descending && o.push("descending=true"), e.include_docs && o.push("include_docs=true"), e.startkey && o.push("startkey=" + encodeURIComponent(JSON.stringify(e.startkey))), e.endkey && o.push("endkey=" + encodeURIComponent(JSON.stringify(e.endkey))), e.limit && o.push("limit=" + e.limit), "undefined" != typeof e.skip && o.push("skip=" + e.skip), o = o.join("&"), "" !== o && (o = "?" + o), "undefined" != typeof e.keys && (a = "POST", r = JSON.stringify({keys: e.keys})), n({headers: s.headers, method: a, url: i(s, "_all_docs" + o), body: r}, t)
                    }, l.changes = function(e) {
                        var t = 25;
                        if (!l.taskqueue.ready()) {
                            var r = l.taskqueue.addTask("changes", arguments);
                            return{cancel: function() {
                                    return r.task ? r.task.cancel() : (r.parameters[0].aborted = !0, void 0)
                                }}
                        }
                        if ("latest" === e.since) {
                            var o;
                            return l.info(function(t, n) {
                                e.aborted || (e.since = n.update_seq, o = l.changes(e))
                            }), {cancel: function() {
                                    return o ? o.cancel() : (e.aborted = !0, void 0)
                                }}
                        }
                        var a = {}, d = "undefined" != typeof e.limit ? e.limit : !1;
                        0 === d && (d = 1);
                        var f = d;
                        if (e.style && (a.style = e.style), (e.include_docs || e.filter && "function" == typeof e.filter) && (a.include_docs = !0), e.continuous && (a.feed = "longpoll"), e.conflicts && (a.conflicts = !0), e.descending && (a.descending = !0), e.filter && "string" == typeof e.filter && (a.filter = e.filter, "_view" === e.filter && e.view && "string" == typeof e.view && (a.view = e.view)), e.query_params && "object" == typeof e.query_params)
                            for (var p in e.query_params)
                                e.query_params.hasOwnProperty(p) && (a[p] = e.query_params[p]);
                        var v, h, m, _, g = function(r, o) {
                            a.since = r, e.continuous || _ || (_ = m), a.limit = !d || f > t ? t : f;
                            var u = "?" + Object.keys(a).map(function(e) {
                                return e + "=" + a[e]
                            }).join("&"), c = {headers: s.headers, method: "GET", url: i(s, "_changes" + u), timeout: null};
                            h = r, e.aborted || (v = n(c, o))
                        }, y = 10, b = 0, k = {results: []}, w = function(n, r) {
                            if (r && r.results) {
                                k.last_seq = r.last_seq;
                                var o = {};
                                o.query = e.query_params, r.results = r.results.filter(function(t) {
                                    f--;
                                    var n = u.filterChange(e)(t);
                                    return n && (k.results.push(t), u.call(e.onChange, t)), n
                                })
                            } else
                                n && (e.aborted = !0, u.call(e.complete, n, null));
                            r && r.last_seq && (h = r.last_seq);
                            var i = r && r.results.length || 0;
                            _ -= t;
                            var a = d && 0 >= f || r && !i && 0 >= _ || i && r.last_seq === m || e.descending && 0 !== h;
                            if (e.continuous || !a) {
                                n ? b += 1 : b = 0;
                                var s = 1 << b, l = y * s, p = e.maximumWait || 3e4;
                                l > p && u.call(e.complete, n || c.UNKNOWN_ERROR, null), setTimeout(function() {
                                    g(h, w)
                                }, l)
                            } else
                                u.call(e.complete, null, k)
                        };
                        return e.continuous ? g(e.since || 0, w) : l.info(function(t, n) {
                            return t ? u.call(e.complete, t) : (m = n.update_seq, g(e.since || 0, w), void 0)
                        }), {cancel: function() {
                                e.aborted = !0, v.abort()
                            }}
                    }, l.revsDiff = function(e, t, r) {
                        return l.taskqueue.ready() ? ("function" == typeof t && (r = t, t = {}), n({headers: s.headers, method: "POST", url: i(s, "_revs_diff"), body: e}, function(e, t) {
                            u.call(r, e, t)
                        }), void 0) : (l.taskqueue.addTask("revsDiff", arguments), void 0)
                    }, l.close = function(e) {
                        return l.taskqueue.ready() ? (u.call(e, null), void 0) : (l.taskqueue.addTask("close", arguments), void 0)
                    }, l.replicateOnServer = function(e, r, i) {
                        if (!l.taskqueue.ready())
                            return l.taskqueue.addTask("replicateOnServer", arguments), i;
                        var a = o(e.id()), c = {source: s.db, target: a.protocol === s.protocol && a.authority === s.authority ? a.db : a.source};
                        r.continuous && (c.continuous = !0), r.create_target && (c.create_target = !0), r.doc_ids && (c.doc_ids = r.doc_ids), r.filter && "string" == typeof r.filter && (c.filter = r.filter), r.query_params && (c.query_params = r.query_params);
                        var d, f = {}, p = {headers: s.headers, method: "POST", url: s.protocol + "://" + s.host + (80 === s.port ? "" : ":" + s.port) + "/_replicate", body: c};
                        i.cancel = function() {
                            this.cancelled = !0, d && !f.ok && d.abort(), f._local_id && (p.body = {replication_id: f._local_id}), p.body.cancel = !0, n(p, function(e, n, o) {
                                return e ? u.call(t, e) : (u.call(r.complete, null, f, o), void 0)
                            })
                        }, i.cancelled || (d = n(p, function(e, n, o) {
                            return e ? u.call(t, e) : (f.ok = !0, n._local_id && (f._local_id = n._local_id), u.call(r.complete, null, n, o), void 0)
                        }))
                    }, l
                }
                var u = e("../utils"), c = e("../deps/errors");
                n.options = {strictMode: !1, key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"], q: {name: "queryKey", parser: /(?:^|&)([^&=]*)=?([^&]*)/g}, parser: {strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/, loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}}, s.destroy = function(e, t, n) {
                    var r = o(e, t);
                    t = t || {}, "function" == typeof t && (n = t, t = {}), t.headers = r.headers, t.method = "DELETE", t.url = i(r, ""), u.ajax(t, n)
                }, s.valid = function() {
                    return!0
                }, t.exports = s
            }, {"../deps/errors": 7, "../utils": 14}], 3: [function(e, t) {
                "use strict";
                function n(e) {
                    return function(t) {
                        o.call(e, {status: 500, error: t.type, reason: t.target})
                    }
                }
                function r(e, t) {
                    function s(e) {
                        e.createObjectStore(l, {keyPath: "id"}).createIndex("seq", "seq", {unique: !0}), e.createObjectStore(f, {autoIncrement: !0}).createIndex("_doc_id_rev", "_doc_id_rev", {unique: !0}), e.createObjectStore(p, {keyPath: "digest"}), e.createObjectStore(v, {keyPath: "id", autoIncrement: !1}), e.createObjectStore(h)
                    }
                    function u(e) {
                        for (var t = e.length, n = new ArrayBuffer(t), r = new Uint8Array(n), o = 0; t > o; o++)
                            r[o] = e.charCodeAt(o);
                        return n
                    }
                    function c(e, t) {
                        return e._bulk_seq - t._bulk_seq
                    }
                    var d = 1, l = "document-store", f = "by-sequence", p = "attach-store", v = "meta-store", h = "detect-blob-support", m = e.name, _ = window.indexedDB.open(m, d);
                    "openReqList"in r || (r.openReqList = {}), r.openReqList[m] = _;
                    var g = null, y = null, b = {}, k = null;
                    return _.onupgradeneeded = function(e) {
                        for (var t = e.target.result, n = e.oldVersion; n !== e.newVersion; )
                            0 === n && s(t), n++
                    }, _.onsuccess = function(e) {
                        k = e.target.result, k.onversionchange = function() {
                            k.close()
                        };
                        var n = k.transaction([v, h], "readwrite"), r = n.objectStore(v).get(v);
                        r.onsuccess = function(e) {
                            var r = e.target.result || {id: v};
                            m + "_id"in r ? y = r[m + "_id"] : (y = o.uuid(), r[m + "_id"] = y, n.objectStore(v).put(r));
                            try {
                                n.objectStore(h).put(o.createBlob(), "key"), g = !0
                            } catch (i) {
                                g = !1
                            } finally {
                                o.call(t, null, b)
                            }
                        }
                    }, _.onerror = n(t), b.type = function() {
                        return"idb"
                    }, b.id = function() {
                        return y
                    }, b._bulkDocs = function(e, t, s) {
                        function d(e) {
                            var t = e.target.result;
                            t.updateSeq = (t.updateSeq || 0) + x, N.objectStore(v).put(t)
                        }
                        function h() {
                            if (!C.length)
                                return N.objectStore(v).get(v).onsuccess = d, void 0;
                            var e = C.shift(), t = N.objectStore(l).get(e.metadata.id);
                            t.onsuccess = function(t) {
                                var n = t.target.result;
                                n ? q(n, e) : S(e)
                            }
                        }
                        function _() {
                            var e = [];
                            A.sort(c), A.forEach(function(t) {
                                if (delete t._bulk_seq, t.error)
                                    return e.push(t), void 0;
                                var n = t.metadata, a = i.winningRev(n);
                                e.push({ok: !0, id: n.id, rev: a}), o.isLocalId(n.id) || (r.Changes.notify(m), r.Changes.notifyLocalWindows(m))
                            }), o.call(s, null, e)
                        }
                        function y(e, t) {
                            if (e.stub)
                                return t();
                            if ("string" == typeof e.data) {
                                var n;
                                try {
                                    n = atob(e.data)
                                } catch (r) {
                                    var i = o.error(a.BAD_ARG, "Attachments need to be base64 encoded");
                                    return o.call(s, i)
                                }
                                if (e.digest = "md5-" + o.Crypto.MD5(n), g) {
                                    var c = e.content_type;
                                    n = u(n), e.data = o.createBlob([n], {type: c})
                                }
                                return t()
                            }
                            var d = new FileReader;
                            d.onloadend = function() {
                                e.digest = "md5-" + o.Crypto.MD5(this.result), g || (e.data = btoa(this.result)), t()
                            }, d.readAsBinaryString(e.data)
                        }
                        function b(e) {
                            function t() {
                                n++, C.length === n && e()
                            }
                            if (!C.length)
                                return e();
                            var n = 0;
                            C.forEach(function(e) {
                                function n() {
                                    o++, o === r.length && t()
                                }
                                var r = e.data && e.data._attachments ? Object.keys(e.data._attachments) : [];
                                if (!r.length)
                                    return t();
                                var o = 0;
                                for (var i in e.data._attachments)
                                    y(e.data._attachments[i], n)
                            })
                        }
                        function w(e, t) {
                            function n(e) {
                                a || (e ? (a = e, o.call(t, a)) : s === u.length && i())
                            }
                            function r(e) {
                                s++, n(e)
                            }
                            function i() {
                                e.data._doc_id_rev = e.data._id + "::" + e.data._rev;
                                var n = N.objectStore(f).put(e.data);
                                n.onsuccess = function(n) {
                                    e.metadata.seq = n.target.result, delete e.metadata.rev;
                                    var r = N.objectStore(l).put(e.metadata);
                                    r.onsuccess = function() {
                                        A.push(e), o.call(t)
                                    }
                                }
                            }
                            var a = null, s = 0;
                            e.data._id = e.metadata.id, e.data._rev = e.metadata.rev, x++, o.isDeleted(e.metadata, e.metadata.rev) && (e.data._deleted = !0);
                            var u = e.data._attachments ? Object.keys(e.data._attachments) : [];
                            for (var c in e.data._attachments)
                                if (e.data._attachments[c].stub)
                                    s++, n();
                                else {
                                    var d = e.data._attachments[c].data;
                                    delete e.data._attachments[c].data;
                                    var p = e.data._attachments[c].digest;
                                    O(e, p, d, r)
                                }
                            u.length || i()
                        }
                        function q(e, t) {
                            var n = i.merge(e.rev_tree, t.metadata.rev_tree[0], 1e3), r = o.isDeleted(e), s = r && o.isDeleted(t.metadata) || !r && R && "new_leaf" !== n.conflicts;
                            return s ? (A.push(E(a.REV_CONFLICT, t._bulk_seq)), h()) : (t.metadata.rev_tree = n.tree, w(t, h), void 0)
                        }
                        function S(e) {
                            return"was_delete"in t && o.isDeleted(e.metadata) ? (A.push(a.MISSING_DOC), h()) : (w(e, h), void 0)
                        }
                        function E(e, t) {
                            return e._bulk_seq = t, e
                        }
                        function O(e, t, n, r) {
                            {
                                var i = N.objectStore(p);
                                i.get(t).onsuccess = function(a) {
                                    var s = a.target.result && a.target.result.refs || {}, u = [e.metadata.id, e.metadata.rev].join("@"), c = {digest: t, body: n, refs: s};
                                    c.refs[u] = !0;
                                    i.put(c).onsuccess = function() {
                                        o.call(r)
                                    }
                                }
                            }
                        }
                        var R = t.new_edits, T = e.docs, C = T.map(function(e, t) {
                            var n = o.parseDoc(e, R);
                            return n._bulk_seq = t, n
                        }), D = C.filter(function(e) {
                            return e.error
                        });
                        if (D.length)
                            return o.call(s, D[0]);
                        var N, A = [], x = 0;
                        b(function() {
                            N = k.transaction([l, f, p, v], "readwrite"), N.onerror = n(s), N.ontimeout = n(s), N.oncomplete = _, h()
                        })
                    }, b._get = function(e, t, n) {
                        function r() {
                            o.call(n, c, {doc: s, metadata: u, ctx: d})
                        }
                        var s, u, c, d;
                        d = t.ctx ? t.ctx : k.transaction([l, f, p], "readonly"), d.objectStore(l).get(e).onsuccess = function(e) {
                            if (u = e.target.result, !u)
                                return c = a.MISSING_DOC, r();
                            if (o.isDeleted(u) && !t.rev)
                                return c = o.error(a.MISSING_DOC, "deleted"), r();
                            var n = i.winningRev(u), l = u.id + "::" + (t.rev ? t.rev : n), p = d.objectStore(f).index("_doc_id_rev");
                            p.get(l).onsuccess = function(e) {
                                return s = e.target.result, s && s._doc_id_rev && delete s._doc_id_rev, s ? (r(), void 0) : (c = a.MISSING_DOC, r())
                            }
                        }
                    }, b._getAttachment = function(e, t, n) {
                        var r, i;
                        i = t.ctx ? t.ctx : k.transaction([l, f, p], "readonly");
                        var a = e.digest, s = e.content_type;
                        i.objectStore(p).get(a).onsuccess = function(e) {
                            var i = e.target.result.body;
                            if (t.encode)
                                if (g) {
                                    var a = new FileReader;
                                    a.onloadend = function() {
                                        r = btoa(this.result), o.call(n, null, r)
                                    }, a.readAsBinaryString(i)
                                } else
                                    r = i, o.call(n, null, r);
                            else
                                g ? r = i : (i = u(atob(i)), r = o.createBlob([i], {type: s})), o.call(n, null, r)
                        }
                    }, b._allDocs = function(e, t) {
                        var n = "startkey"in e ? e.startkey : !1, r = "endkey"in e ? e.endkey : !1, a = "descending"in e ? e.descending : !1;
                        a = a ? "prev" : null;
                        var s = n && r ? window.IDBKeyRange.bound(n, r) : n ? window.IDBKeyRange.lowerBound(n) : r ? window.IDBKeyRange.upperBound(r) : null, u = k.transaction([l, f], "readonly");
                        u.oncomplete = function() {
                            "keys"in e && (e.keys.forEach(function(e) {
                                e in v ? p.push(v[e]) : p.push({key: e, error: "not_found"})
                            }), e.descending && p.reverse()), o.call(t, null, {total_rows: p.length, offset: e.skip, rows: "limit"in e ? p.slice(e.skip, e.limit + e.skip) : e.skip > 0 ? p.slice(e.skip) : p})
                        };
                        var c = u.objectStore(l), d = a ? c.openCursor(s, a) : c.openCursor(s), p = [], v = {};
                        d.onsuccess = function(t) {
                            function n(t, n) {
                                if (o.isLocalId(t.id))
                                    return r["continue"]();
                                var a = {id: t.id, key: t.id, value: {rev: i.winningRev(t)}};
                                if (e.include_docs) {
                                    a.doc = n, a.doc._rev = i.winningRev(t), a.doc._doc_id_rev && delete a.doc._doc_id_rev, e.conflicts && (a.doc._conflicts = i.collectConflicts(t));
                                    for (var s in a.doc._attachments)
                                        a.doc._attachments[s].stub = !0
                                }
                                "keys"in e ? e.keys.indexOf(t.id) > -1 && (o.isDeleted(t) && (a.value.deleted = !0, a.doc = null), v[a.id] = a) : o.isDeleted(t) || p.push(a), r["continue"]()
                            }
                            if (t.target.result) {
                                var r = t.target.result, a = r.value;
                                if (e.include_docs) {
                                    var s = u.objectStore(f).index("_doc_id_rev"), c = i.winningRev(a), d = a.id + "::" + c;
                                    s.get(d).onsuccess = function(e) {
                                        n(r.value, e.target.result)
                                    }
                                } else
                                    n(a)
                            }
                        }
                    }, b._info = function(e) {
                        function t(e) {
                            o = e.target.result && e.target.result.updateSeq || 0
                        }
                        function n(e) {
                            var n = e.target.result;
                            return n ? (n.value.deleted !== !0 && r++, n["continue"](), void 0) : (i.objectStore(v).get(v).onsuccess = t, void 0)
                        }
                        var r = 0, o = 0, i = k.transaction([l, v], "readonly");
                        i.oncomplete = function() {
                            e(null, {db_name: m, doc_count: r, update_seq: o})
                        }, i.objectStore(l).openCursor().onsuccess = n
                    }, b._changes = function(e) {
                        function t() {
                            p = k.transaction([l, f]), p.oncomplete = a;
                            var t;
                            t = c ? p.objectStore(f).openCursor(window.IDBKeyRange.lowerBound(e.since, !0), c) : p.objectStore(f).openCursor(window.IDBKeyRange.lowerBound(e.since, !0)), t.onsuccess = n, t.onerror = s
                        }
                        function n(t) {
                            if (!t.target.result) {
                                for (var n = 0, r = v.length; r > n; n++) {
                                    var a = v[n];
                                    a && _.push(a)
                                }
                                return!1
                            }
                            var s = t.target.result, u = s.value._id, c = h[u];
                            if (void 0 !== c)
                                return v[c].seq = s.key, v.push(v[c]), v[c] = null, h[u] = v.length - 1, s["continue"]();
                            var m = p.objectStore(l);
                            m.get(s.value._id).onsuccess = function(t) {
                                var n = t.target.result;
                                if (o.isLocalId(n.id))
                                    return s["continue"]();
                                d < n.seq && (d = n.seq);
                                var r = i.winningRev(n), a = n.id + "::" + r, u = p.objectStore(f).index("_doc_id_rev");
                                u.get(a).onsuccess = function(t) {
                                    var a = t.target.result;
                                    delete a._doc_id_rev;
                                    var u = [{rev: r}];
                                    "all_docs" === e.style && (u = i.collectLeaves(n.rev_tree).map(function(e) {
                                        return{rev: e.rev}
                                    }));
                                    var c = {id: n.id, seq: s.key, changes: u, doc: a};
                                    o.isDeleted(n, r) && (c.deleted = !0), e.conflicts && (c.doc._conflicts = i.collectConflicts(n));
                                    var d = c.id, l = h[d];
                                    void 0 !== l && (v[l] = null), v.push(c), h[d] = v.length - 1, s["continue"]()
                                }
                            }
                        }
                        function a() {
                            o.processChanges(e, _, d)
                        }
                        function s() {
                            o.call(e.complete)
                        }
                        if (e.continuous) {
                            var u = m + ":" + o.uuid();
                            return e.cancelled = !1, r.Changes.addListener(m, u, b, e), r.Changes.notify(m), {cancel: function() {
                                    e.cancelled = !0, r.Changes.removeListener(m, u)
                                }}
                        }
                        var c = e.descending ? "prev" : null, d = 0;
                        e.since = e.since && !c ? e.since : 0;
                        var p, v = [], h = {}, _ = [];
                        t()
                    }, b._close = function(e) {
                        return null === k ? o.call(e, a.NOT_OPEN) : (k.close(), o.call(e, null), void 0)
                    }, b._getRevisionTree = function(e, t) {
                        var n = k.transaction([l], "readonly"), r = n.objectStore(l).get(e);
                        r.onsuccess = function(e) {
                            var n = e.target.result;
                            n ? o.call(t, null, n.rev_tree) : o.call(t, a.MISSING_DOC)
                        }
                    }, b._doCompaction = function(e, t, n, r) {
                        var i = k.transaction([l, f], "readwrite"), a = i.objectStore(l);
                        a.get(e).onsuccess = function(r) {
                            var o = r.target.result;
                            o.rev_tree = t;
                            var a = n.length;
                            n.forEach(function(t) {
                                var n = i.objectStore(f).index("_doc_id_rev"), r = e + "::" + t;
                                n.getKey(r).onsuccess = function(e) {
                                    var t = e.target.result;
                                    if (t) {
                                        {
                                            i.objectStore(f)["delete"](t)
                                        }
                                        a--, a || i.objectStore(l).put(o)
                                    }
                                }
                            })
                        }, i.oncomplete = function() {
                            o.call(r)
                        }
                    }, b
                }
                var o = e("../utils"), i = e("../merge"), a = e("../deps/errors");
                r.valid = function() {
                    return"undefined" != typeof window && !!window.indexedDB
                }, r.destroy = function(e, t, i) {
                    "openReqList"in r || (r.openReqList = {}), r.Changes.clearListeners(e), r.openReqList[e] && r.openReqList[e].result && r.openReqList[e].result.close();
                    var a = window.indexedDB.deleteDatabase(e);
                    a.onsuccess = function() {
                        r.openReqList[e] && (r.openReqList[e] = null), o.call(i, null)
                    }, a.onerror = n(i)
                }, r.Changes = new o.Changes, t.exports = r
            }, {"../deps/errors": 7, "../merge": 12, "../utils": 14}], 4: [function(e, t) {
                "use strict";
                function n(e) {
                    return"'" + e + "'"
                }
                function r(e) {
                    return function(t) {
                        i.call(e, {status: 500, error: t.type, reason: t.target})
                    }
                }
                function o(e, t) {
                    function v() {
                        t(null, _)
                    }
                    function h() {
                        b.transaction(function(e) {
                            var t = "CREATE TABLE IF NOT EXISTS " + p + " (update_seq, dbid)", n = "CREATE TABLE IF NOT EXISTS " + f + " (digest, json, body BLOB)", r = "CREATE TABLE IF NOT EXISTS " + d + " (id unique, seq, json, winningseq)", o = "CREATE TABLE IF NOT EXISTS " + l + " (seq INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, doc_id_rev UNIQUE, json)";
                            e.executeSql(n), e.executeSql(r), e.executeSql(o), e.executeSql(t);
                            var a = "SELECT update_seq FROM " + p;
                            e.executeSql(a, [], function(e, t) {
                                if (!t.rows.length) {
                                    var n = "INSERT INTO " + p + " (update_seq) VALUES (?)";
                                    return e.executeSql(n, [0]), void 0
                                }
                            });
                            var s = "SELECT dbid FROM " + p + " WHERE dbid IS NOT NULL";
                            e.executeSql(s, [], function(e, t) {
                                if (!t.rows.length) {
                                    var n = "UPDATE " + p + " SET dbid=?";
                                    return g = i.uuid(), e.executeSql(n, [g]), void 0
                                }
                                g = t.rows.item(0).dbid
                            })
                        }, r(t), v)
                    }
                    function m(e) {
                        return e.map(function(e) {
                            return{rev: e.rev}
                        })
                    }
                    var _ = {}, g = null, y = e.name, b = openDatabase(y, u, y, c);
                    return b ? (i.isCordova() && "undefined" != typeof window ? window.addEventListener(y + "_pouch", function k() {
                        window.removeEventListener(y + "_pouch", k, !1), h()
                    }, !1) : h(), _.type = function() {
                        return"websql"
                    }, _.id = function() {
                        return g
                    }, _._info = function(e) {
                        b.transaction(function(t) {
                            var n = "SELECT COUNT(id) AS count FROM " + d;
                            t.executeSql(n, [], function(t, n) {
                                var r = n.rows.item(0).count, o = "SELECT update_seq FROM " + p;
                                t.executeSql(o, [], function(t, n) {
                                    var o = n.rows.item(0).update_seq;
                                    e(null, {db_name: y, doc_count: r, update_seq: o})
                                })
                            })
                        })
                    }, _._bulkDocs = function(e, t, u) {
                        function c(e, t) {
                            return e._bulk_seq - t._bulk_seq
                        }
                        function v() {
                            var e = [];
                            A.sort(c), A.forEach(function(t) {
                                if (delete t._bulk_seq, t.error)
                                    return e.push(t), void 0;
                                var n = t.metadata, r = a.winningRev(n);
                                e.push({ok: !0, id: n.id, rev: r}), i.isLocalId(n.id) || (T++, o.Changes.notify(y), o.Changes.notifyLocalWindows(y))
                            });
                            var t = "SELECT update_seq FROM " + p;
                            N.executeSql(t, [], function(t, n) {
                                var r = n.rows.item(0).update_seq + T, o = "UPDATE " + p + " SET update_seq=?";
                                t.executeSql(o, [r], function() {
                                    i.call(u, null, e)
                                })
                            })
                        }
                        function h(e, t) {
                            if (e.stub)
                                return t();
                            if ("string" == typeof e.data) {
                                try {
                                    e.data = atob(e.data)
                                } catch (n) {
                                    var r = i.error(s.BAD_ARG, "Attachments need to be base64 encoded");
                                    return i.call(u, r)
                                }
                                return e.digest = "md5-" + i.Crypto.MD5(e.data), t()
                            }
                            var o = new FileReader;
                            o.onloadend = function() {
                                e.data = this.result, e.digest = "md5-" + i.Crypto.MD5(this.result), t()
                            }, o.readAsBinaryString(e.data)
                        }
                        function m(e) {
                            function t() {
                                n++, C.length === n && e()
                            }
                            if (!C.length)
                                return e();
                            var n = 0, r = 0;
                            C.forEach(function(e) {
                                function n() {
                                    r++, r === o.length && t()
                                }
                                var o = e.data && e.data._attachments ? Object.keys(e.data._attachments) : [];
                                if (!o.length)
                                    return t();
                                for (var i in e.data._attachments)
                                    h(e.data._attachments[i], n)
                            })
                        }
                        function _(e, t, n) {
                            function r() {
                                var t = e.data, n = "INSERT INTO " + l + " (doc_id_rev, json) VALUES (?, ?);";
                                N.executeSql(n, [t._id + "::" + t._rev, JSON.stringify(t)], u)
                            }
                            function o(e) {
                                c || (e ? (c = e, i.call(t, c)) : f === p.length && r())
                            }
                            function s(e) {
                                f++, o(e)
                            }
                            function u(r, o) {
                                var s = e.metadata.seq = o.insertId;
                                delete e.metadata.rev;
                                var u = a.winningRev(e.metadata), c = n ? "UPDATE " + d + " SET seq=?, json=?, winningseq=(SELECT seq FROM " + l + " WHERE doc_id_rev=?) WHERE id=?" : "INSERT INTO " + d + " (id, seq, winningseq, json) VALUES (?, ?, ?, ?);", f = JSON.stringify(e.metadata), p = e.metadata.id + "::" + u, v = n ? [s, f, p, e.metadata.id] : [e.metadata.id, s, s, f];
                                r.executeSql(c, v, function() {
                                    A.push(e), i.call(t, null)
                                })
                            }
                            var c = null, f = 0;
                            e.data._id = e.metadata.id, e.data._rev = e.metadata.rev, i.isDeleted(e.metadata, e.metadata.rev) && (e.data._deleted = !0);
                            var p = e.data._attachments ? Object.keys(e.data._attachments) : [];
                            for (var v in e.data._attachments)
                                if (e.data._attachments[v].stub)
                                    f++, o();
                                else {
                                    var h = e.data._attachments[v].data;
                                    delete e.data._attachments[v].data;
                                    var m = e.data._attachments[v].digest;
                                    S(e, m, h, s)
                                }
                            p.length || r()
                        }
                        function g(e, t) {
                            var n = a.merge(e.rev_tree, t.metadata.rev_tree[0], 1e3), r = i.isDeleted(e) && i.isDeleted(t.metadata) || !i.isDeleted(e) && O && "new_leaf" !== n.conflicts;
                            return r ? (A.push(q(s.REV_CONFLICT, t._bulk_seq)), w()) : (t.metadata.rev_tree = n.tree, _(t, w, !0), void 0)
                        }
                        function k(e) {
                            return"was_delete"in t && i.isDeleted(e.metadata) ? (A.push(s.MISSING_DOC), w()) : (_(e, w, !1), void 0)
                        }
                        function w() {
                            if (!C.length)
                                return v();
                            var e = C.shift(), t = e.metadata.id;
                            t in x ? g(x[t], e) : (x[t] = e.metadata, k(e))
                        }
                        function q(e, t) {
                            return e._bulk_seq = t, e
                        }
                        function S(e, t, n, r) {
                            var o = [e.metadata.id, e.metadata.rev].join("@"), a = {digest: t}, s = "SELECT digest, json FROM " + f + " WHERE digest=?";
                            N.executeSql(s, [t], function(e, u) {
                                u.rows.length ? (a.refs = JSON.parse(u.rows.item(0).json).refs, s = "UPDATE " + f + " SET json=?, body=? WHERE digest=?", e.executeSql(s, [JSON.stringify(a), n, t], function() {
                                    i.call(r, null)
                                })) : (a.refs = {}, a.refs[o] = !0, s = "INSERT INTO " + f + "(digest, json, body) VALUES (?, ?, ?)", e.executeSql(s, [t, JSON.stringify(a), n], function() {
                                    i.call(r, null)
                                }))
                            })
                        }
                        function E(e, t) {
                            for (var n = 0; n < t.rows.length; n++) {
                                var r = t.rows.item(n);
                                x[r.id] = JSON.parse(r.json)
                            }
                            w()
                        }
                        var O = t.new_edits, R = e.docs, T = 0, C = R.map(function(e, t) {
                            var n = i.parseDoc(e, O);
                            return n._bulk_seq = t, n
                        }), D = C.filter(function(e) {
                            return e.error
                        });
                        if (D.length)
                            return i.call(u, D[0]);
                        var N, A = [], x = {};
                        m(function() {
                            b.transaction(function(e) {
                                N = e;
                                var t = "(" + C.map(function(e) {
                                    return n(e.metadata.id)
                                }).join(",") + ")", r = "SELECT * FROM " + d + " WHERE id IN " + t;
                                N.executeSql(r, [], E)
                            }, r(u))
                        })
                    }, _._get = function(e, t, n) {
                        function r() {
                            i.call(n, c, {doc: o, metadata: u, ctx: f})
                        }
                        var o, u, c;
                        if (!t.ctx)
                            return b.transaction(function(r) {
                                t.ctx = r, _._get(e, t, n)
                            }), void 0;
                        var f = t.ctx, p = "SELECT * FROM " + d + " WHERE id=?";
                        f.executeSql(p, [e], function(e, n) {
                            if (!n.rows.length)
                                return c = s.MISSING_DOC, r();
                            if (u = JSON.parse(n.rows.item(0).json), i.isDeleted(u) && !t.rev)
                                return c = i.error(s.MISSING_DOC, "deleted"), r();
                            var d = a.winningRev(u), p = t.rev ? t.rev : d;
                            p = u.id + "::" + p;
                            var v = "SELECT * FROM " + l + " WHERE doc_id_rev=?";
                            f.executeSql(v, [p], function(e, t) {
                                return t.rows.length ? (o = JSON.parse(t.rows.item(0).json), r(), void 0) : (c = s.MISSING_DOC, r())
                            })
                        })
                    }, _._allDocs = function(e, t) {
                        var o = [], s = {}, u = "startkey"in e ? e.startkey : !1, c = "endkey"in e ? e.endkey : !1, f = "descending"in e ? e.descending : !1, p = "SELECT " + d + ".id, " + l + ".seq, " + l + ".json AS data, " + d + ".json AS metadata FROM " + l + " JOIN " + d + " ON " + l + ".seq = " + d + ".winningseq";
                        "keys"in e ? p += " WHERE " + d + ".id IN (" + e.keys.map(function(e) {
                            return n(e)
                        }).join(",") + ")" : (u && (p += " WHERE " + d + '.id >= "' + u + '"'), c && (p += (u ? " AND " : " WHERE ") + d + '.id <= "' + c + '"'), p += " ORDER BY " + d + ".id " + (f ? "DESC" : "ASC")), b.transaction(function(t) {
                            t.executeSql(p, [], function(t, n) {
                                for (var r = 0, u = n.rows.length; u > r; r++) {
                                    var c = n.rows.item(r), d = JSON.parse(c.metadata), l = JSON.parse(c.data);
                                    if (!i.isLocalId(d.id)) {
                                        if (c = {id: d.id, key: d.id, value: {rev: a.winningRev(d)}}, e.include_docs) {
                                            c.doc = l, c.doc._rev = a.winningRev(d), e.conflicts && (c.doc._conflicts = a.collectConflicts(d));
                                            for (var f in c.doc._attachments)
                                                c.doc._attachments[f].stub = !0
                                        }
                                        "keys"in e ? e.keys.indexOf(d.id) > -1 && (i.isDeleted(d) && (c.value.deleted = !0, c.doc = null), s[c.id] = c) : i.isDeleted(d) || o.push(c)
                                    }
                                }
                            })
                        }, r(t), function() {
                            "keys"in e && (e.keys.forEach(function(e) {
                                e in s ? o.push(s[e]) : o.push({key: e, error: "not_found"})
                            }), e.descending && o.reverse()), i.call(t, null, {total_rows: o.length, offset: e.skip, rows: "limit"in e ? o.slice(e.skip, e.limit + e.skip) : e.skip > 0 ? o.slice(e.skip) : o})
                        })
                    }, _._changes = function(e) {
                        function t() {
                            var t = "SELECT " + d + ".id, " + l + ".seq, " + l + ".json AS data, " + d + ".json AS metadata FROM " + l + " JOIN " + d + " ON " + l + ".seq = " + d + ".winningseq WHERE " + d + ".seq > " + e.since + " ORDER BY " + d + ".seq " + (r ? "DESC" : "ASC");
                            b.transaction(function(n) {
                                n.executeSql(t, [], function(t, n) {
                                    for (var r = 0, o = 0, u = n.rows.length; u > o; o++) {
                                        var c = n.rows.item(o), d = JSON.parse(c.metadata);
                                        if (!i.isLocalId(d.id)) {
                                            r < c.seq && (r = c.seq);
                                            var l = JSON.parse(c.data), f = l._rev, p = [{rev: f}];
                                            "all_docs" === e.style && (p = m(a.collectLeaves(d.rev_tree)));
                                            var v = {id: d.id, seq: c.seq, changes: p, doc: l};
                                            i.isDeleted(d, f) && (v.deleted = !0), e.conflicts && (v.doc._conflicts = a.collectConflicts(d)), s.push(v)
                                        }
                                    }
                                    i.processChanges(e, s, r)
                                })
                            })
                        }
                        if (e.continuous) {
                            var n = y + ":" + i.uuid();
                            return e.cancelled = !1, o.Changes.addListener(y, n, _, e), o.Changes.notify(y), {cancel: function() {
                                    e.cancelled = !0, o.Changes.removeListener(y, n)
                                }}
                        }
                        var r = e.descending;
                        e.since = e.since && !r ? e.since : 0;
                        var s = [];
                        t()
                    }, _._close = function(e) {
                        i.call(e, null)
                    }, _._getAttachment = function(e, t, n) {
                        var r, o = t.ctx, a = e.digest, s = e.content_type, u = "SELECT body FROM " + f + " WHERE digest=?";
                        o.executeSql(u, [a], function(e, o) {
                            var a = o.rows.item(0).body;
                            r = t.encode ? btoa(a) : i.createBlob([a], {type: s}), i.call(n, null, r)
                        })
                    }, _._getRevisionTree = function(e, t) {
                        b.transaction(function(n) {
                            var r = "SELECT json AS metadata FROM " + d + " WHERE id = ?";
                            n.executeSql(r, [e], function(e, n) {
                                if (n.rows.length) {
                                    var r = JSON.parse(n.rows.item(0).metadata);
                                    i.call(t, null, r.rev_tree)
                                } else
                                    i.call(t, s.MISSING_DOC)
                            })
                        })
                    }, _._doCompaction = function(e, t, r, o) {
                        b.transaction(function(a) {
                            var s = "SELECT json AS metadata FROM " + d + " WHERE id = ?";
                            a.executeSql(s, [e], function(a, s) {
                                if (!s.rows.length)
                                    return i.call(o);
                                var u = JSON.parse(s.rows.item(0).metadata);
                                u.rev_tree = t;
                                var c = "DELETE FROM " + l + " WHERE doc_id_rev IN (" + r.map(function(t) {
                                    return n(e + "::" + t)
                                }).join(",") + ")";
                                a.executeSql(c, [], function(t) {
                                    var n = "UPDATE " + d + " SET json = ? WHERE id = ?";
                                    t.executeSql(n, [JSON.stringify(u), e], function() {
                                        o()
                                    })
                                })
                            })
                        })
                    }, _) : i.call(t, s.UNKNOWN_ERROR)
                }
                var i = e("../utils"), a = e("../merge"), s = e("../deps/errors"), u = 1, c = 5242880, d = n("document-store"), l = n("by-sequence"), f = n("attach-store"), p = n("metadata-store");
                o.valid = function() {
                    return"undefined" != typeof window && !!window.openDatabase
                }, o.destroy = function(e, t, n) {
                    var o = openDatabase(e, u, e, c);
                    o.transaction(function(e) {
                        e.executeSql("DROP TABLE IF EXISTS " + d, []), e.executeSql("DROP TABLE IF EXISTS " + l, []), e.executeSql("DROP TABLE IF EXISTS " + f, []), e.executeSql("DROP TABLE IF EXISTS " + p, [])
                    }, r(n), function() {
                        i.call(n, null)
                    })
                }, o.Changes = new i.Changes, t.exports = o
            }, {"../deps/errors": 7, "../merge": 12, "../utils": 14}], 5: [function(e, t) {
                function n(e, t) {
                    function n(e) {
                        var t = Array.prototype.slice.call(arguments, 1);
                        typeof e == typeof Function && e.apply(this, t)
                    }
                    function a(t, r, o) {
                        if (e.binary || e.json || !e.processData || "string" == typeof t) {
                            if (!e.binary && e.json && "string" == typeof t)
                                try {
                                    t = JSON.parse(t)
                                } catch (i) {
                                    return n(o, i), void 0
                                }
                        } else
                            t = JSON.stringify(t);
                        n(o, null, t, r)
                    }
                    function s(e, t) {
                        var r, i = {status: e.status};
                        try {
                            r = JSON.parse(e.responseText), i = o(!0, {}, i, r)
                        } catch (a) {
                        }
                        n(t, i)
                    }
                    function u(e, t, n) {
                        if (n) {
                            var r = new Date;
                            r.setTime(r.getTime() + 24 * n * 60 * 60 * 1e3);
                            var o = "; expires=" + r.toGMTString()
                        } else
                            var o = "";
                        document.cookie = e + "=" + t + o + "; path=/"
                    }
                    function c() {
                        f = !0, p.abort(), n(s, p, t)
                    }
                    "function" == typeof e && (t = e, e = {});
                    var d = {method: "GET", headers: {}, json: !0, processData: !0, timeout: 1e4};
                    if (e = o(!0, d, e), "undefined" != typeof window && window.XMLHttpRequest) {
                        var l, f = !1, p = new XMLHttpRequest;
                        p.open(e.method, e.url), p.withCredentials = !0, e.json && (e.headers.Accept = "application/json", e.headers["Content-Type"] = e.headers["Content-Type"] || "application/json", e.body && e.processData && "string" != typeof e.body && (e.body = JSON.stringify(e.body))), e.binary && (p.responseType = "arraybuffer");
                        for (var v in e.headers)
                            if ("Cookie" === v) {
                                var h = e.headers[v].split("=");
                                u(h[0], h[1], 10)
                            } else
                                p.setRequestHeader(v, e.headers[v]);
                        return"body"in e || (e.body = null), p.onreadystatechange = function() {
                            if (4 === p.readyState && !f)
                                if (clearTimeout(l), p.status >= 200 && p.status < 300) {
                                    var r;
                                    r = e.binary ? i([p.response || ""], {type: p.getResponseHeader("Content-Type")}) : p.responseText, n(a, r, p, t)
                                } else
                                    n(s, p, t)
                        }, e.timeout > 0 && (l = setTimeout(c, e.timeout)), p.send(e.body), {abort: c}
                    }
                    return e.json && (e.binary || (e.headers.Accept = "application/json"), e.headers["Content-Type"] = e.headers["Content-Type"] || "application/json"), e.binary && (e.encoding = null, e.json = !1), e.processData || (e.json = !1), r(e, function(r, o, i) {
                        if (r)
                            return r.status = o ? o.statusCode : 400, n(s, r, t);
                        var u = o.headers["content-type"], c = i || "";
                        e.binary || !e.json && e.processData || "object" == typeof c || !(/json/.test(u) || /^[\s]*\{/.test(c) && /\}[\s]*$/.test(c)) || (c = JSON.parse(c)), o.statusCode >= 200 && o.statusCode < 300 ? n(a, c, o, t) : (e.binary && (c = JSON.parse(c.toString())), c.status = o.statusCode, n(t, c))
                    })
                }
                var r = e("request"), o = e("./extend.js"), i = e("./blob.js");
                t.exports = n
            }, {"./blob.js": 6, "./extend.js": 8, request: 16}], 6: [function(e, t) {
                function n(e, t) {
                    e = e || [], t = t || {};
                    try {
                        return new Blob(e, t)
                    } catch (n) {
                        if ("TypeError" !== n.name)
                            throw n;
                        for (var r = window.BlobBuilder || window.MSBlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder, o = new r, i = 0; i < e.length; i += 1)
                            o.append(e[i]);
                        return o.getBlob(t.type)
                    }
                }
                t.exports = n
            }, {}], 7: [function(e, t) {
                t.exports = {MISSING_BULK_DOCS: {status: 400, error: "bad_request", reason: "Missing JSON list of 'docs'"}, MISSING_DOC: {status: 404, error: "not_found", reason: "missing"}, REV_CONFLICT: {status: 409, error: "conflict", reason: "Document update conflict"}, INVALID_ID: {status: 400, error: "invalid_id", reason: "_id field must contain a string"}, MISSING_ID: {status: 412, error: "missing_id", reason: "_id is required for puts"}, RESERVED_ID: {status: 400, error: "bad_request", reason: "Only reserved document ids may start with underscore."}, NOT_OPEN: {status: 412, error: "precondition_failed", reason: "Database not open so cannot close"}, UNKNOWN_ERROR: {status: 500, error: "unknown_error", reason: "Database encountered an unknown error"}, BAD_ARG: {status: 500, error: "badarg", reason: "Some query argument is invalid"}, INVALID_REQUEST: {status: 400, error: "invalid_request", reason: "Request was invalid"}, QUERY_PARSE_ERROR: {status: 400, error: "query_parse_error", reason: "Some query parameter is invalid"}, DOC_VALIDATION: {status: 500, error: "doc_validation", reason: "Bad special document member"}, BAD_REQUEST: {status: 400, error: "bad_request", reason: "Something wrong with the request"}, NOT_AN_OBJECT: {status: 400, error: "bad_request", reason: "Document must be a JSON object"}, DB_MISSING: {status: 404, error: "not_found", reason: "Database not found"}}
            }, {}], 8: [function(e, t) {
                function n(e) {
                    return null === e ? String(e) : "object" == typeof e || "function" == typeof e ? s[l.call(e)] || "object" : typeof e
                }
                function r(e) {
                    return null !== e && e === e.window
                }
                function o(e) {
                    if (!e || "object" !== n(e) || e.nodeType || r(e))
                        return!1;
                    try {
                        if (e.constructor && !f.call(e, "constructor") && !f.call(e.constructor.prototype, "isPrototypeOf"))
                            return!1
                    } catch (t) {
                        return!1
                    }
                    var o;
                    for (o in e)
                        ;
                    return void 0 === o || f.call(e, o)
                }
                function i(e) {
                    return"function" === n(e)
                }
                function a() {
                    var e, t, n, r, s, u, c = arguments[0] || {}, d = 1, l = arguments.length, f = !1;
                    for ("boolean" == typeof c && (f = c, c = arguments[1] || {}, d = 2), "object" == typeof c || i(c) || (c = {}), l === d && (c = this, --d); l > d; d++)
                        if (null != (e = arguments[d]))
                            for (t in e)
                                n = c[t], r = e[t], c !== r && (f && r && (o(r) || (s = p(r))) ? (s ? (s = !1, u = n && p(n) ? n : []) : u = n && o(n) ? n : {}, c[t] = a(f, u, r)) : void 0 !== r && (p(e) && i(r) || (c[t] = r)));
                    return c
                }
                for (var s = {}, u = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error"], c = 0; c < u.length; c++) {
                    var d = u[c];
                    s["[object " + d + "]"] = d.toLowerCase()
                }
                var l = s.toString, f = s.hasOwnProperty, p = Array.isArray || function(e) {
                    return"array" === n(e)
                };
                t.exports = a
            }, {}], 9: [function(e, t, n) {
                var r = e("__browserify_process"), o = e("crypto");
                n.MD5 = function(e) {
                    function t(e, t) {
                        return e << t | e >>> 32 - t
                    }
                    function n(e, t) {
                        var n, r, o, i, a;
                        return o = 2147483648 & e, i = 2147483648 & t, n = 1073741824 & e, r = 1073741824 & t, a = (1073741823 & e) + (1073741823 & t), n & r ? 2147483648 ^ a ^ o ^ i : n | r ? 1073741824 & a ? 3221225472 ^ a ^ o ^ i : 1073741824 ^ a ^ o ^ i : a ^ o ^ i
                    }
                    function i(e, t, n) {
                        return e & t | ~e & n
                    }
                    function a(e, t, n) {
                        return e & n | t & ~n
                    }
                    function s(e, t, n) {
                        return e ^ t ^ n
                    }
                    function u(e, t, n) {
                        return t ^ (e | ~n)
                    }
                    function c(e, r, o, a, s, u, c) {
                        return e = n(e, n(n(i(r, o, a), s), c)), n(t(e, u), r)
                    }
                    function d(e, r, o, i, s, u, c) {
                        return e = n(e, n(n(a(r, o, i), s), c)), n(t(e, u), r)
                    }
                    function l(e, r, o, i, a, u, c) {
                        return e = n(e, n(n(s(r, o, i), a), c)), n(t(e, u), r)
                    }
                    function f(e, r, o, i, a, s, c) {
                        return e = n(e, n(n(u(r, o, i), a), c)), n(t(e, s), r)
                    }
                    function p(e) {
                        for (var t, n = e.length, r = n + 8, o = (r - r % 64) / 64, i = 16 * (o + 1), a = Array(i - 1), s = 0, u = 0; n > u; )
                            t = (u - u % 4) / 4, s = u % 4 * 8, a[t] = a[t] | e.charCodeAt(u) << s, u++;
                        return t = (u - u % 4) / 4, s = u % 4 * 8, a[t] = a[t] | 128 << s, a[i - 2] = n << 3, a[i - 1] = n >>> 29, a
                    }
                    function v(e) {
                        var t, n, r = "", o = "";
                        for (n = 0; 3 >= n; n++)
                            t = e >>> 8 * n & 255, o = "0" + t.toString(16), r += o.substr(o.length - 2, 2);
                        return r
                    }
                    if (!r.browser)
                        return o.createHash("md5").update(e).digest("hex");
                    var h, m, _, g, y, b, k, w, q, S = Array(), E = 7, O = 12, R = 17, T = 22, C = 5, D = 9, N = 14, A = 20, x = 4, j = 11, I = 16, L = 23, B = 6, M = 10, P = 15, U = 21;
                    for (S = p(e), b = 1732584193, k = 4023233417, w = 2562383102, q = 271733878, h = 0; h < S.length; h += 16)
                        m = b, _ = k, g = w, y = q, b = c(b, k, w, q, S[h + 0], E, 3614090360), q = c(q, b, k, w, S[h + 1], O, 3905402710), w = c(w, q, b, k, S[h + 2], R, 606105819), k = c(k, w, q, b, S[h + 3], T, 3250441966), b = c(b, k, w, q, S[h + 4], E, 4118548399), q = c(q, b, k, w, S[h + 5], O, 1200080426), w = c(w, q, b, k, S[h + 6], R, 2821735955), k = c(k, w, q, b, S[h + 7], T, 4249261313), b = c(b, k, w, q, S[h + 8], E, 1770035416), q = c(q, b, k, w, S[h + 9], O, 2336552879), w = c(w, q, b, k, S[h + 10], R, 4294925233), k = c(k, w, q, b, S[h + 11], T, 2304563134), b = c(b, k, w, q, S[h + 12], E, 1804603682), q = c(q, b, k, w, S[h + 13], O, 4254626195), w = c(w, q, b, k, S[h + 14], R, 2792965006), k = c(k, w, q, b, S[h + 15], T, 1236535329), b = d(b, k, w, q, S[h + 1], C, 4129170786), q = d(q, b, k, w, S[h + 6], D, 3225465664), w = d(w, q, b, k, S[h + 11], N, 643717713), k = d(k, w, q, b, S[h + 0], A, 3921069994), b = d(b, k, w, q, S[h + 5], C, 3593408605), q = d(q, b, k, w, S[h + 10], D, 38016083), w = d(w, q, b, k, S[h + 15], N, 3634488961), k = d(k, w, q, b, S[h + 4], A, 3889429448), b = d(b, k, w, q, S[h + 9], C, 568446438), q = d(q, b, k, w, S[h + 14], D, 3275163606), w = d(w, q, b, k, S[h + 3], N, 4107603335), k = d(k, w, q, b, S[h + 8], A, 1163531501), b = d(b, k, w, q, S[h + 13], C, 2850285829), q = d(q, b, k, w, S[h + 2], D, 4243563512), w = d(w, q, b, k, S[h + 7], N, 1735328473), k = d(k, w, q, b, S[h + 12], A, 2368359562), b = l(b, k, w, q, S[h + 5], x, 4294588738), q = l(q, b, k, w, S[h + 8], j, 2272392833), w = l(w, q, b, k, S[h + 11], I, 1839030562), k = l(k, w, q, b, S[h + 14], L, 4259657740), b = l(b, k, w, q, S[h + 1], x, 2763975236), q = l(q, b, k, w, S[h + 4], j, 1272893353), w = l(w, q, b, k, S[h + 7], I, 4139469664), k = l(k, w, q, b, S[h + 10], L, 3200236656), b = l(b, k, w, q, S[h + 13], x, 681279174), q = l(q, b, k, w, S[h + 0], j, 3936430074), w = l(w, q, b, k, S[h + 3], I, 3572445317), k = l(k, w, q, b, S[h + 6], L, 76029189), b = l(b, k, w, q, S[h + 9], x, 3654602809), q = l(q, b, k, w, S[h + 12], j, 3873151461), w = l(w, q, b, k, S[h + 15], I, 530742520), k = l(k, w, q, b, S[h + 2], L, 3299628645), b = f(b, k, w, q, S[h + 0], B, 4096336452), q = f(q, b, k, w, S[h + 7], M, 1126891415), w = f(w, q, b, k, S[h + 14], P, 2878612391), k = f(k, w, q, b, S[h + 5], U, 4237533241), b = f(b, k, w, q, S[h + 12], B, 1700485571), q = f(q, b, k, w, S[h + 3], M, 2399980690), w = f(w, q, b, k, S[h + 10], P, 4293915773), k = f(k, w, q, b, S[h + 1], U, 2240044497), b = f(b, k, w, q, S[h + 8], B, 1873313359), q = f(q, b, k, w, S[h + 15], M, 4264355552), w = f(w, q, b, k, S[h + 6], P, 2734768916), k = f(k, w, q, b, S[h + 13], U, 1309151649), b = f(b, k, w, q, S[h + 4], B, 4149444226), q = f(q, b, k, w, S[h + 11], M, 3174756917), w = f(w, q, b, k, S[h + 2], P, 718787259), k = f(k, w, q, b, S[h + 9], U, 3951481745), b = n(b, m), k = n(k, _), w = n(w, g), q = n(q, y);
                    var F = v(b) + v(k) + v(w) + v(q);
                    return F.toLowerCase()
                }
            }, {__browserify_process: 17, crypto: 16}], 10: [function(e, t) {
                function n(e, t) {
                    var r, o = n.CHARS, i = [];
                    if (t = t || o.length, e)
                        for (r = 0; e > r; r++)
                            i[r] = o[0 | Math.random() * t];
                    else {
                        var a;
                        for (i[8] = i[13] = i[18] = i[23] = "-", i[14] = "4", r = 0; 36 > r; r++)
                            i[r] || (a = 0 | 16 * Math.random(), i[r] = o[19 == r ? 3 & a | 8 : a])
                    }
                    return i.join("")
                }
                n.CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""), t.exports = n
            }, {}], 11: [function(e, t) {
                function n(e, t, r) {
                    if (!(this instanceof n))
                        return new n(e, t, r);
                    ("function" == typeof t || "undefined" == typeof t) && (r = t, t = {}), "object" == typeof e && (t = e, e = void 0), "undefined" == typeof r && (r = function() {
                    });
                    var o = n.parseAdapter(t.name || e);
                    if (t.originalName = e, t.name = t.name || o.name, t.adapter = t.adapter || o.adapter, !n.adapters[t.adapter])
                        throw"Adapter is missing";
                    if (!n.adapters[t.adapter].valid())
                        throw"Invalid Adapter";
                    var a = new i(t, function(e, t) {
                        if (e)
                            return r && r(e), void 0;
                        for (var o in n.plugins) {
                            var i = n.plugins[o](t);
                            for (var a in i)
                                a in t || (t[a] = i[a])
                        }
                        t.taskqueue.ready(!0), t.taskqueue.execute(t), r(null, t)
                    });
                    for (var s in a)
                        this[s] = a[s];
                    for (var u in n.plugins) {
                        var c = n.plugins[u](this);
                        for (var d in c)
                            d in this || (this[d] = c[d])
                    }
                }
                var r = e("__browserify_process"), o = e("./utils"), i = e("./adapter")(n);
                n.adapters = {}, n.plugins = {}, n.prefix = "_pouch_", n.parseAdapter = function(e) {
                    var t, r = e.match(/([a-z\-]*):\/\/(.*)/);
                    if (r) {
                        if (e = /http(s?)/.test(r[1]) ? r[1] + "://" + r[2] : r[2], t = r[1], !n.adapters[t].valid())
                            throw"Invalid adapter";
                        return{name: e, adapter: r[1]}
                    }
                    for (var o = ["idb", "leveldb", "websql"], i = 0; i < o.length; ++i)
                        if (o[i]in n.adapters) {
                            t = n.adapters[o[i]];
                            var a = "use_prefix"in t ? t.use_prefix : !0;
                            return{name: a ? n.prefix + e : e, adapter: o[i]}
                        }
                    throw"No valid adapter found"
                }, n.destroy = function(e, t, r) {
                    ("function" == typeof t || "undefined" == typeof t) && (r = t, t = {}), "object" == typeof e && (t = e, e = void 0), "undefined" == typeof r && (r = function() {
                    });
                    var o = n.parseAdapter(t.name || e), i = function(e) {
                        if (e)
                            return r(e), void 0;
                        for (var i in n.plugins)
                            n.plugins[i]._delete(o.name);
                        n.adapters[o.adapter].destroy(o.name, t, r)
                    };
                    n.removeFromAllDbs(o, i)
                }, n.removeFromAllDbs = function(e, t) {
                    if (!n.enableAllDbs)
                        return t(), void 0;
                    var r = e.adapter;
                    return"http" === r || "https" === r ? (t(), void 0) : (new n(n.allDBName(e.adapter), function(r, o) {
                        if (r)
                            return t(), void 0;
                        var i = n.dbName(e.adapter, e.name);
                        o.get(i, function(e, n) {
                            e ? t() : o.remove(n, function(e) {
                                t()
                            })
                        })
                    }), void 0)
                }, n.adapter = function(e, t) {
                    t.valid() && (n.adapters[e] = t)
                }, n.plugin = function(e, t) {
                    n.plugins[e] = t
                }, n.enableAllDbs = !1, n.ALL_DBS = "_allDbs", n.dbName = function(e, t) {
                    return[e, "-", t].join("")
                }, n.realDBName = function(e, t) {
                    return[e, "://", t].join("")
                }, n.allDBName = function(e) {
                    return[e, "://", n.prefix + n.ALL_DBS].join("")
                }, n.open = function(e, t) {
                    if (!n.enableAllDbs)
                        return t(), void 0;
                    var r = e.adapter;
                    return"http" === r || "https" === r ? (t(), void 0) : (new n(n.allDBName(r), function(o, i) {
                        if (o)
                            return t(), void 0;
                        var a = n.dbName(r, e.name);
                        i.get(a, function(n) {
                            n && 404 === n.status ? i.put({_id: a, dbname: e.originalName}, function(e) {
                                t()
                            }) : t()
                        })
                    }), void 0)
                }, n.allDbs = function(e) {
                    var t = function(r, o) {
                        if (0 === r.length) {
                            var i = [];
                            return o.forEach(function(e) {
                                var t = i.some(function(t) {
                                    return t.id === e.id
                                });
                                t || i.push(e)
                            }), e(null, i.map(function(e) {
                                return e.doc.dbname
                            })), void 0
                        }
                        var a = r.shift();
                        return"http" === a || "https" === a ? (t(r, o), void 0) : (new n(n.allDBName(a), function(n, i) {
                            return n ? (e(n), void 0) : (i.allDocs({include_docs: !0}, function(n, i) {
                                return n ? (e(n), void 0) : (o.unshift.apply(o, i.rows), t(r, o), void 0)
                            }), void 0)
                        }), void 0)
                    }, r = Object.keys(n.adapters);
                    t(r, [])
                }, t.exports = n, n.ajax = e("./deps/ajax"), n.extend = e("./deps/extend"), n.utils = o, n.Errors = e("./deps/errors"), n.replicate = e("./replicate").replicate, n.version = e("./version");
                var a = e("./adapters/http");
                if (n.adapter("http", a), n.adapter("https", a), n.adapter("idb", e("./adapters/idb")), n.adapter("websql", e("./adapters/websql")), n.plugin("mapreduce", e("pouchdb-mapreduce")), !r.browser) {
                    var s = e("./adapters/leveldb");
                    n.adapter("ldb", s), n.adapter("leveldb", s)
                }
            }, {"./adapter": 1, "./adapters/http": 2, "./adapters/idb": 3, "./adapters/leveldb": 16, "./adapters/websql": 4, "./deps/ajax": 5, "./deps/errors": 7, "./deps/extend": 8, "./replicate": 13, "./utils": 14, "./version": 15, __browserify_process: 17, "pouchdb-mapreduce": 18}], 12: [function(e, t) {
                "use strict";
                function n(e) {
                    for (var t, n = e.shift(), r = [n.id, n.opts, []], o = r; e.length; )
                        n = e.shift(), t = [n.id, n.opts, []], o[2].push(t), o = t;
                    return r
                }
                function r(e, t) {
                    for (var n = [{tree1: e, tree2: t}], r = !1; n.length > 0; ) {
                        var o = n.pop(), i = o.tree1, a = o.tree2;
                        (i[1].status || a[1].status) && (i[1].status = "available" === i[1].status || "available" === a[1].status ? "available" : "missing");
                        for (var s = 0; s < a[2].length; s++)
                            if (i[2][0]) {
                                for (var u = !1, c = 0; c < i[2].length; c++)
                                    i[2][c][0] === a[2][s][0] && (n.push({tree1: i[2][c], tree2: a[2][s]}), u = !0);
                                u || (r = "new_branch", i[2].push(a[2][s]), i[2].sort())
                            } else
                                r = "new_leaf", i[2][0] = a[2][s]
                    }
                    return{conflicts: r, tree: e}
                }
                function o(e, t, n) {
                    var o, i = [], a = !1, s = !1;
                    return e.length ? (e.forEach(function(e) {
                        if (e.pos === t.pos && e.ids[0] === t.ids[0])
                            o = r(e.ids, t.ids), i.push({pos: e.pos, ids: o.tree}), a = a || o.conflicts, s = !0;
                        else if (n !== !0) {
                            var u = e.pos < t.pos ? e : t, c = e.pos < t.pos ? t : e, d = c.pos - u.pos, l = [], f = [];
                            for (f.push({ids: u.ids, diff: d, parent: null, parentIdx: null}); f.length > 0; ) {
                                var p = f.pop();
                                0 !== p.diff ? p.ids && p.ids[2].forEach(function(e, t) {
                                    f.push({ids: e, diff: p.diff - 1, parent: p.ids, parentIdx: t})
                                }) : p.ids[0] === c.ids[0] && l.push(p)
                            }
                            var v = l[0];
                            v ? (o = r(v.ids, c.ids), v.parent[2][v.parentIdx] = o.tree, i.push({pos: u.pos, ids: u.ids}), a = a || o.conflicts, s = !0) : i.push(e)
                        } else
                            i.push(e)
                    }), s || i.push(t), i.sort(function(e, t) {
                        return e.pos - t.pos
                    }), {tree: i, conflicts: a || "internal_node"}) : {tree: [t], conflicts: "new_leaf"}
                }
                function i(e, t) {
                    var r = s.rootToLeaf(e).map(function(e) {
                        var r = e.ids.slice(-t);
                        return{pos: e.pos + (e.ids.length - r.length), ids: n(r)}
                    });
                    return r.reduce(function(e, t) {
                        return o(e, t, !0).tree
                    }, [r.shift()])
                }
                var a = e("./deps/extend"), s = {};
                s.merge = function(e, t, n) {
                    e = a(!0, [], e), t = a(!0, {}, t);
                    var r = o(e, t);
                    return{tree: i(r.tree, n), conflicts: r.conflicts}
                }, s.winningRev = function(e) {
                    var t = [];
                    return s.traverseRevTree(e.rev_tree, function(e, n, r, o, i) {
                        e && t.push({pos: n, id: r, deleted: !!i.deleted})
                    }), t.sort(function(e, t) {
                        return e.deleted !== t.deleted ? e.deleted > t.deleted ? 1 : -1 : e.pos !== t.pos ? t.pos - e.pos : e.id < t.id ? 1 : -1
                    }), t[0].pos + "-" + t[0].id
                }, s.traverseRevTree = function(e, t) {
                    var n = [];
                    for (e.forEach(function(e) {
                        n.push({pos: e.pos, ids: e.ids})
                    }); n.length > 0; ) {
                        var r = n.pop(), o = r.pos, i = r.ids, a = t(0 === i[2].length, o, i[0], r.ctx, i[1]);
                        i[2].forEach(function(e) {
                            n.push({pos: o + 1, ids: e, ctx: a})
                        })
                    }
                }, s.collectLeaves = function(e) {
                    var t = [];
                    return s.traverseRevTree(e, function(e, n, r, o, i) {
                        e && t.unshift({rev: n + "-" + r, pos: n, opts: i})
                    }), t.sort(function(e, t) {
                        return t.pos - e.pos
                    }), t.map(function(e) {
                        delete e.pos
                    }), t
                }, s.collectConflicts = function(e) {
                    var t = s.winningRev(e), n = s.collectLeaves(e.rev_tree), r = [];
                    return n.forEach(function(e) {
                        e.rev === t || e.opts.deleted || r.push(e.rev)
                    }), r
                }, s.rootToLeaf = function(e) {
                    var t = [];
                    return s.traverseRevTree(e, function(e, n, r, o, i) {
                        if (o = o ? o.slice(0) : [], o.push({id: r, opts: i}), e) {
                            var a = n + 1 - o.length;
                            t.unshift({pos: a, ids: o})
                        }
                        return o
                    }), t
                }, t.exports = s
            }, {"./deps/extend": 8}], 13: [function(e, t, n) {
                "use strict";
                function r() {
                    var e = this;
                    this.cancelled = !1, this.cancel = function() {
                        e.cancelled = !0
                    }
                }
                function o(e) {
                    var t = [], n = {}, r = !1;
                    return n.enqueue = function(e, o) {
                        t.push({fun: e, args: o}), r || n.process()
                    }, n.process = function() {
                        if (!r && t.length && !e.cancelled) {
                            r = !0;
                            var n = t.shift();
                            n.fun.apply(null, n.args)
                        }
                    }, n.notifyRequestComplete = function() {
                        r = !1, n.process()
                    }, n
                }
                function i(e, t, n) {
                    var r = n.filter ? n.filter.toString() : "";
                    return"_local/" + d.Crypto.MD5(e.id() + t.id() + r)
                }
                function a(e, t, n, r) {
                    t.get(n, function(t, o) {
                        t && 404 === t.status ? r(null, 0) : e.get(n, function(e, t) {
                            e && 404 === e.status || o.last_seq !== t.last_seq ? r(null, 0) : r(null, t.last_seq)
                        })
                    })
                }
                function s(e, t, n, r, o) {
                    function i(e, t) {
                        e.get(n, function(o, i) {
                            o && 404 === o.status && (i = {_id: n}), i.last_seq = r, e.put(i, t)
                        })
                    }
                    i(t, function() {
                        i(e, function() {
                            o()
                        })
                    })
                }
                function u(e, t, n, r) {
                    function u(r, o, i) {
                        if (n.onChange)
                            for (var a = 0; i > a; a++)
                                n.onChange.apply(this, [O]);
                        w -= i, O.docs_written += i, s(e, t, y, q, function() {
                            _.notifyRequestComplete(), m()
                        })
                    }
                    function c() {
                        if (!g.length)
                            return _.notifyRequestComplete();
                        var e = g.length;
                        t.bulkDocs({docs: g}, {new_edits: !1}, function(t, n) {
                            u(t, n, e)
                        }), g = []
                    }
                    function l(t, n) {
                        e.get(t, {revs: !0, rev: n, attachments: !0}, function(e, t) {
                            O.docs_read++, _.notifyRequestComplete(), g.push(t), _.enqueue(c)
                        })
                    }
                    function f(e) {
                        return function(t, o) {
                            if (_.notifyRequestComplete(), t)
                                return S && r.cancel(), d.call(n.complete, t, null), void 0;
                            if (0 === Object.keys(o).length) {
                                for (var i in e)
                                    w -= e[i];
                                return m(), void 0
                            }
                            var a = function(e) {
                                _.enqueue(l, [s, e])
                            };
                            for (var s in o) {
                                var u = e[s] - o[s].missing.length;
                                w -= u, o[s].missing.forEach(a)
                            }
                        }
                    }
                    function p(e, n) {
                        t.revsDiff(e, f(n))
                    }
                    function v(e) {
                        q = e.seq, b.push(e);
                        var t = {};
                        t[e.id] = e.changes.map(function(e) {
                            return e.rev
                        });
                        var n = {};
                        n[e.id] = e.changes.length, w += e.changes.length, _.enqueue(p, [t, n])
                    }
                    function h() {
                        k = !0, m()
                    }
                    function m() {
                        k && 0 === w && (O.end_time = new Date, d.call(n.complete, null, O))
                    }
                    var _ = new o(r), g = [], y = i(e, t, n), b = [], k = !1, w = 0, q = 0, S = n.continuous || !1, E = n.doc_ids, O = {ok: !0, start_time: new Date, docs_read: 0, docs_written: 0};
                    a(e, t, y, function(t, o) {
                        if (t)
                            return d.call(n.complete, t);
                        if (q = o, !r.cancelled) {
                            var i = {continuous: S, since: q, style: "all_docs", onChange: v, complete: h, doc_ids: E};
                            n.filter && (i.filter = n.filter), n.query_params && (i.query_params = n.query_params);
                            var a = e.changes(i);
                            if (n.continuous) {
                                var s = r.cancel;
                                r.cancel = function() {
                                    s(), a.cancel()
                                }
                            }
                        }
                    })
                }
                function c(e, t) {
                    return"string" == typeof e ? new l(e, t) : (t(null, e), void 0)
                }
                var d = e("./utils"), l = e("./index");
                n.replicate = function(e, t, n, o) {
                    n instanceof Function && (o = n, n = {}), void 0 === n && (n = {}), n.complete || (n.complete = o);
                    var i = new r;
                    return c(e, function(e, r) {
                        return e ? d.call(o, e) : (c(t, function(e, t) {
                            if (e)
                                return d.call(o, e);
                            if (n.server) {
                                if ("function" != typeof r.replicateOnServer)
                                    return d.call(o, {error: "Server replication not supported for " + r.type() + " adapter"});
                                if (r.type() !== t.type())
                                    return d.call(o, {error: "Server replication for different adapter types (" + r.type() + " and " + t.type() + ") is not supported"});
                                r.replicateOnServer(t, n, i)
                            } else
                                u(r, t, n, i)
                        }), void 0)
                    }), i
                }
            }, {"./index": 11, "./utils": 14}], 14: [function(e, t, n) {
                function r(e) {
                    return/^_/.test(e) ? /^_(design|local)/.test(e) : !0
                }
                function o() {
                    return"undefined" != typeof chrome && "undefined" != typeof chrome.storage && "undefined" != typeof chrome.storage.local
                }
                var i = e("./merge");
                n.extend = e("./deps/extend"), n.ajax = e("./deps/ajax"), n.createBlob = e("./deps/blob");
                var a = e("./deps/uuid");
                n.Crypto = e("./deps/md5.js");
                var s = e("./deps/buffer"), u = e("./deps/errors");
                n.error = function(e, t) {
                    return n.extend({}, e, {reason: t})
                };
                var c = ["_id", "_rev", "_attachments", "_deleted", "_revisions", "_revs_info", "_conflicts", "_deleted_conflicts", "_local_seq", "_rev_tree"];
                n.uuids = function(e, t) {
                    "object" != typeof t && (t = {});
                    for (var n = t.length, r = t.radix, o = []; o.push(a(n, r)) < e; )
                        ;
                    return o
                }, n.uuid = function(e) {
                    return n.uuids(1, e)[0]
                }, n.call = function(e) {
                    if (typeof e == typeof Function) {
                        var t = Array.prototype.slice.call(arguments, 1);
                        e.apply(this, t)
                    }
                }, n.isLocalId = function(e) {
                    return/^_local/.test(e)
                }, n.isDeleted = function(e, t) {
                    t || (t = i.winningRev(e)), t.indexOf("-") >= 0 && (t = t.split("-")[1]);
                    var n = !1;
                    return i.traverseRevTree(e.rev_tree, function(e, r, o, i, a) {
                        o === t && (n = !!a.deleted)
                    }), n
                }, n.filterChange = function(e) {
                    return function(t) {
                        var n = {}, r = e.filter && "function" == typeof e.filter;
                        if (n.query = e.query_params, e.filter && r && !e.filter.call(this, t.doc, n))
                            return!1;
                        if (e.doc_ids && -1 === e.doc_ids.indexOf(t.id))
                            return!1;
                        if (e.include_docs)
                            for (var o in t.doc._attachments)
                                t.doc._attachments[o].stub = !0;
                        else
                            delete t.doc;
                        return!0
                    }
                }, n.processChanges = function(e, t, r) {
                    t = t.filter(n.filterChange(e)), e.limit && e.limit < t.length && (t.length = e.limit), t.forEach(function(t) {
                        n.call(e.onChange, t)
                    }), n.call(e.complete, null, {results: t, last_seq: r})
                }, n.parseDoc = function(e, t) {
                    var o, i, a, s = null, d = {status: "available"};
                    if (e._deleted && (d.deleted = !0), t)
                        if (e._id || (e._id = n.uuid()), i = n.uuid({length: 32, radix: 16}).toLowerCase(), e._rev) {
                            if (a = /^(\d+)-(.+)$/.exec(e._rev), !a)
                                throw"invalid value for property '_rev'";
                            e._rev_tree = [{pos: parseInt(a[1], 10), ids: [a[2], {status: "missing"}, [[i, d, []]]]}], o = parseInt(a[1], 10) + 1
                        } else
                            e._rev_tree = [{pos: 1, ids: [i, d, []]}], o = 1;
                    else if (e._revisions && (e._rev_tree = [{pos: e._revisions.start - e._revisions.ids.length + 1, ids: e._revisions.ids.reduce(function(e, t) {
                                return null === e ? [t, d, []] : [t, {status: "missing"}, [e]]
                            }, null)}], o = e._revisions.start, i = e._revisions.ids[0]), !e._rev_tree) {
                        if (a = /^(\d+)-(.+)$/.exec(e._rev), !a)
                            return u.BAD_ARG;
                        o = parseInt(a[1], 10), i = a[2], e._rev_tree = [{pos: parseInt(a[1], 10), ids: [a[2], d, []]}]
                    }
                    "string" != typeof e._id ? s = u.INVALID_ID : r(e._id) || (s = u.RESERVED_ID);
                    for (var l in e)
                        e.hasOwnProperty(l) && "_" === l[0] && -1 === c.indexOf(l) && (s = n.extend({}, u.DOC_VALIDATION), s.reason += ": " + l);
                    return e._id = decodeURIComponent(e._id), e._rev = [o, i].join("-"), s ? s : Object.keys(e).reduce(function(t, n) {
                        return/^_/.test(n) && "_attachments" !== n ? t.metadata[n.slice(1)] = e[n] : t.data[n] = e[n], t
                    }, {metadata: {}, data: {}})
                }, n.isCordova = function() {
                    return"undefined" != typeof cordova || "undefined" != typeof PhoneGap || "undefined" != typeof phonegap
                }, n.Changes = function() {
                    var e = {}, t = {};
                    return o() ? chrome.storage.onChanged.addListener(function(t) {
                        null != t.db_name && e.notify(t.db_name.newValue)
                    }) : "undefined" != typeof window && window.addEventListener("storage", function(t) {
                        e.notify(t.key)
                    }), e.addListener = function(e, n, r, o) {
                        t[e] || (t[e] = {}), t[e][n] = {db: r, opts: o}
                    }, e.removeListener = function(e, n) {
                        t[e] && delete t[e][n]
                    }, e.clearListeners = function(e) {
                        delete t[e]
                    }, e.notifyLocalWindows = function(e) {
                        o() ? chrome.storage.local.set({db_name: e}) : localStorage[e] = "a" === localStorage[e] ? "b" : "a"
                    }, e.notify = function(e) {
                        t[e] && Object.keys(t[e]).forEach(function(r) {
                            var o = t[e][r].opts;
                            t[e][r].db.changes({include_docs: o.include_docs, conflicts: o.conflicts, continuous: !1, descending: !1, filter: o.filter, view: o.view, since: o.since, query_params: o.query_params, onChange: function(e) {
                                    e.seq > o.since && !o.cancelled && (o.since = e.seq, n.call(o.onChange, e))
                                }})
                        })
                    }, e
                }, n.atob = "undefined" != typeof window && "atob"in window ? function(e) {
                    return atob(e)
                } : function(e) {
                    var t = new s(e, "base64");
                    if (t.toString("base64") !== e)
                        throw"Cannot base64 encode full string";
                    return t.toString("binary")
                }, n.btoa = "undefined" != typeof window && "btoa"in window ? function(e) {
                    return btoa(e)
                } : function(e) {
                    return new s(e, "binary").toString("base64")
                }, t.exports = n
            }, {"./deps/ajax": 5, "./deps/blob": 6, "./deps/buffer": 16, "./deps/errors": 7, "./deps/extend": 8, "./deps/md5.js": 9, "./deps/uuid": 10, "./merge": 12}], 15: [function(e, t) {
                t.exports = "1.0.0"
            }, {}], 16: [function() {
            }, {}], 17: [function(e, t) {
                var n = t.exports = {};
                n.nextTick = function() {
                    var e = "undefined" != typeof window && window.setImmediate, t = "undefined" != typeof window && window.postMessage && window.addEventListener;
                    if (e)
                        return function(e) {
                            return window.setImmediate(e)
                        };
                    if (t) {
                        var n = [];
                        return window.addEventListener("message", function(e) {
                            if (e.source === window && "process-tick" === e.data && (e.stopPropagation(), n.length > 0)) {
                                var t = n.shift();
                                t()
                            }
                        }, !0), function(e) {
                            n.push(e), window.postMessage("process-tick", "*")
                        }
                    }
                    return function(e) {
                        setTimeout(e, 0)
                    }
                }(), n.title = "browser", n.browser = !0, n.env = {}, n.argv = [], n.binding = function() {
                    throw new Error("process.binding is not supported")
                }, n.cwd = function() {
                    return"/"
                }, n.chdir = function() {
                    throw new Error("process.chdir is not supported")
                }
            }, {}], 18: [function(require, module, exports) {
                "use strict";
                function MapReduce(db) {
                    function viewQuery(fun, options) {
                        function sum(e) {
                            return e.reduce(function(e, t) {
                                return e + t
                            }, 0)
                        }
                        function emit(e, t) {
                            var n = {id: current.doc._id, key: e, value: t};
                            if (!(options.startkey && pouchCollate(e, options.startkey) < 0 || options.endkey && pouchCollate(e, options.endkey) > 0 || options.key && 0 !== pouchCollate(e, options.key))) {
                                if (num_started++, options.include_docs) {
                                    if (t && "object" == typeof t && t._id)
                                        return db.get(t._id, function(e, t) {
                                            t && (n.doc = t), results.push(n), checkComplete()
                                        }), void 0;
                                    n.doc = current.doc
                                }
                                results.push(n)
                            }
                        }
                        function checkComplete() {
                            if (completed && results.length == num_started) {
                                if (results.sort(function(e, t) {
                                    return pouchCollate(e.key, t.key)
                                }), options.descending && results.reverse(), options.reduce === !1)
                                    return options.complete(null, {total_rows: results.length, offset: options.skip, rows: "limit"in options ? results.slice(options.skip, options.limit + options.skip) : options.skip > 0 ? results.slice(options.skip) : results});
                                var e = [];
                                results.forEach(function(t) {
                                    var n = e[e.length - 1] || null;
                                    return n && 0 === pouchCollate(n.key[0][0], t.key) ? (n.key.push([t.key, t.id]), n.value.push(t.value), void 0) : (e.push({key: [[t.key, t.id]], value: [t.value]}), void 0)
                                }), e.forEach(function(e) {
                                    e.value = fun.reduce(e.key, e.value), e.value = "undefined" == typeof e.value ? null : e.value, e.key = e.key[0][0]
                                }), options.complete(null, {total_rows: e.length, offset: options.skip, rows: "limit"in options ? e.slice(options.skip, options.limit + options.skip) : options.skip > 0 ? e.slice(options.skip) : e})
                            }
                        }
                        if (options.complete) {
                            options.skip || (options.skip = 0), fun.reduce || (options.reduce = !1);
                            var builtInReduce = {_sum: function(e, t) {
                                    return sum(t)
                                }, _count: function(e, t, n) {
                                    return n ? sum(t) : t.length
                                }, _stats: function(e, t) {
                                    return{sum: sum(t), min: Math.min.apply(null, t), max: Math.max.apply(null, t), count: t.length, sumsqr: function() {
                                            var e = 0;
                                            for (var n in t)
                                                "number" == typeof t[n] && (e += t[n] * t[n]);
                                            return e
                                        }()}
                                }}, results = [], current = null, num_started = 0, completed = !1;
                            eval("fun.map = " + fun.map.toString() + ";"), fun.reduce && (builtInReduce[fun.reduce] && (fun.reduce = builtInReduce[fun.reduce]), eval("fun.reduce = " + fun.reduce.toString() + ";")), db.changes({conflicts: !0, include_docs: !0, onChange: function(e) {
                                    "deleted"in e || (current = {doc: e.doc}, fun.map.call(this, e.doc))
                                }, complete: function() {
                                    completed = !0, checkComplete()
                                }})
                        }
                    }
                    function httpQuery(e, t, n) {
                        var r = [], o = void 0, i = "GET";
                        if ("undefined" != typeof t.reduce && r.push("reduce=" + t.reduce), "undefined" != typeof t.include_docs && r.push("include_docs=" + t.include_docs), "undefined" != typeof t.limit && r.push("limit=" + t.limit), "undefined" != typeof t.descending && r.push("descending=" + t.descending), "undefined" != typeof t.startkey && r.push("startkey=" + encodeURIComponent(JSON.stringify(t.startkey))), "undefined" != typeof t.endkey && r.push("endkey=" + encodeURIComponent(JSON.stringify(t.endkey))), "undefined" != typeof t.key && r.push("key=" + encodeURIComponent(JSON.stringify(t.key))), "undefined" != typeof t.group && r.push("group=" + t.group), "undefined" != typeof t.group_level && r.push("group_level=" + t.group_level), "undefined" != typeof t.skip && r.push("skip=" + t.skip), "undefined" != typeof t.keys && (i = "POST", o = JSON.stringify({keys: t.keys})), r = r.join("&"), r = "" === r ? "" : "?" + r, "string" == typeof e) {
                            var a = e.split("/");
                            return db.request({method: i, url: "_design/" + a[0] + "/_view/" + a[1] + r, body: o}, n), void 0
                        }
                        var s = JSON.parse(JSON.stringify(e, function(e, t) {
                            return"function" == typeof t ? t + "" : t
                        }));
                        db.request({method: "POST", url: "_temp_view" + r, body: s}, n)
                    }
                    return this instanceof MapReduce ? (this.query = function(e, t, n) {
                        if ("function" == typeof t && (n = t, t = {}), n && (t.complete = n), "http" === db.type())
                            return"function" == typeof e ? httpQuery({map: e}, t, n) : httpQuery(e, t, n);
                        if ("object" == typeof e)
                            return viewQuery(e, t);
                        if ("function" == typeof e)
                            return viewQuery({map: e}, t);
                        var r = e.split("/");
                        db.get("_design/" + r[0], function(e, o) {
                            return e ? (n && n(e), void 0) : o.views[r[1]] ? (viewQuery({map: o.views[r[1]].map, reduce: o.views[r[1]].reduce}, t), void 0) : (n && n({error: "not_found", reason: "missing_named_view"}), void 0)
                        })
                    }, void 0) : new MapReduce(db)
                }
                var pouchCollate = require("pouchdb-collate");
                MapReduce._delete = function() {
                }, module.exports = MapReduce
            }, {"pouchdb-collate": 19}], 19: [function(e, t) {
                "use strict";
                function n(e, t) {
                    for (var n = Math.min(e.length, t.length), r = 0; n > r; r++) {
                        var o = a(e[r], t[r]);
                        if (0 !== o)
                            return o
                    }
                    return e.length === t.length ? 0 : e.length > t.length ? 1 : -1
                }
                function r(e, t) {
                    return e === t ? 0 : e > t ? 1 : -1
                }
                function o(e, t) {
                    for (var n = Object.keys(e), r = Object.keys(t), o = Math.min(n.length, r.length), i = 0; o > i; i++) {
                        var s = a(n[i], r[i]);
                        if (0 !== s)
                            return s;
                        if (s = a(e[n[i]], t[r[i]]), 0 !== s)
                            return s
                    }
                    return n.length === r.length ? 0 : n.length > r.length ? 1 : -1
                }
                function i(e) {
                    var t = ["boolean", "number", "string", "object"];
                    return-1 !== t.indexOf(typeof e) ? null === e ? 1 : t.indexOf(typeof e) + 2 : Array.isArray(e) ? 4.5 : void 0
                }
                function a(e, t) {
                    var a = i(e), s = i(t);
                    return a - s !== 0 ? a - s : null === e ? 0 : "number" == typeof e ? e - t : "boolean" == typeof e ? t > e ? -1 : 1 : "string" == typeof e ? r(e, t) : Array.isArray(e) ? n(e, t) : "object" == typeof e ? o(e, t) : void 0
                }
                t.exports = a
            }, {}]}, {}, [11])(11)
});