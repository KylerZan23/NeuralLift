"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/stripe-session/route";
exports.ids = ["app/api/stripe-session/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe-session%2Froute&page=%2Fapi%2Fstripe-session%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe-session%2Froute.ts&appDir=%2FUsers%2Fkyler%2FNeuralLift%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fkyler%2FNeuralLift&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe-session%2Froute&page=%2Fapi%2Fstripe-session%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe-session%2Froute.ts&appDir=%2FUsers%2Fkyler%2FNeuralLift%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fkyler%2FNeuralLift&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_kyler_NeuralLift_app_api_stripe_session_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/stripe-session/route.ts */ \"(rsc)/./app/api/stripe-session/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/stripe-session/route\",\n        pathname: \"/api/stripe-session\",\n        filename: \"route\",\n        bundlePath: \"app/api/stripe-session/route\"\n    },\n    resolvedPagePath: \"/Users/kyler/NeuralLift/app/api/stripe-session/route.ts\",\n    nextConfigOutput,\n    userland: _Users_kyler_NeuralLift_app_api_stripe_session_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/stripe-session/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZzdHJpcGUtc2Vzc2lvbiUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGc3RyaXBlLXNlc3Npb24lMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZzdHJpcGUtc2Vzc2lvbiUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmt5bGVyJTJGTmV1cmFsTGlmdCUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZreWxlciUyRk5ldXJhbExpZnQmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ087QUFDcEY7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxpRUFBaUU7QUFDekU7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUN1SDs7QUFFdkgiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXVyYWxpZnQvP2ZkZGIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL2t5bGVyL05ldXJhbExpZnQvYXBwL2FwaS9zdHJpcGUtc2Vzc2lvbi9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvc3RyaXBlLXNlc3Npb24vcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9zdHJpcGUtc2Vzc2lvblwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvc3RyaXBlLXNlc3Npb24vcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMva3lsZXIvTmV1cmFsTGlmdC9hcHAvYXBpL3N0cmlwZS1zZXNzaW9uL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9zdHJpcGUtc2Vzc2lvbi9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe-session%2Froute&page=%2Fapi%2Fstripe-session%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe-session%2Froute.ts&appDir=%2FUsers%2Fkyler%2FNeuralLift%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fkyler%2FNeuralLift&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/stripe-session/route.ts":
/*!*****************************************!*\
  !*** ./app/api/stripe-session/route.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_stripe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/stripe */ \"(rsc)/./lib/stripe.ts\");\n/* harmony import */ var _lib_supabase_server__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/supabase-server */ \"(rsc)/./lib/supabase-server.ts\");\n\n\n\nasync function POST(req) {\n    const { programId, reason } = await req.json();\n    if (!programId) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"programId required\"\n    }, {\n        status: 400\n    });\n    // Derive userId from the program owner; do not trust client input\n    const supabase = (0,_lib_supabase_server__WEBPACK_IMPORTED_MODULE_2__.getServiceSupabaseClient)();\n    const { data: program, error } = await supabase.from(\"programs\").select(\"id,user_id\").eq(\"id\", programId).single();\n    if (error || !program) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Program not found\"\n    }, {\n        status: 404\n    });\n    const url = await (0,_lib_stripe__WEBPACK_IMPORTED_MODULE_1__.createCheckoutSession)({\n        programId,\n        reason: reason ?? \"unlock_full_program\",\n        userId: program.user_id ?? undefined\n    });\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        url\n    }, {\n        status: 200\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3N0cmlwZS1zZXNzaW9uL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBd0Q7QUFDSDtBQUNZO0FBRTFELGVBQWVHLEtBQUtDLEdBQWdCO0lBQ3pDLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxNQUFNLEVBQUUsR0FBRyxNQUFNRixJQUFJRyxJQUFJO0lBQzVDLElBQUksQ0FBQ0YsV0FBVyxPQUFPTCxxREFBWUEsQ0FBQ08sSUFBSSxDQUFDO1FBQUVDLE9BQU87SUFBcUIsR0FBRztRQUFFQyxRQUFRO0lBQUk7SUFDeEYsa0VBQWtFO0lBQ2xFLE1BQU1DLFdBQVdSLDhFQUF3QkE7SUFDekMsTUFBTSxFQUFFUyxNQUFNQyxPQUFPLEVBQUVKLEtBQUssRUFBRSxHQUFHLE1BQU1FLFNBQVNHLElBQUksQ0FBQyxZQUFZQyxNQUFNLENBQUMsY0FBY0MsRUFBRSxDQUFDLE1BQU1WLFdBQVdXLE1BQU07SUFDaEgsSUFBSVIsU0FBUyxDQUFDSSxTQUFTLE9BQU9aLHFEQUFZQSxDQUFDTyxJQUFJLENBQUM7UUFBRUMsT0FBTztJQUFvQixHQUFHO1FBQUVDLFFBQVE7SUFBSTtJQUM5RixNQUFNUSxNQUFNLE1BQU1oQixrRUFBcUJBLENBQUM7UUFBRUk7UUFBV0MsUUFBUUEsVUFBVTtRQUF1QlksUUFBUU4sUUFBUU8sT0FBTyxJQUFJQztJQUFVO0lBQ25JLE9BQU9wQixxREFBWUEsQ0FBQ08sSUFBSSxDQUFDO1FBQUVVO0lBQUksR0FBRztRQUFFUixRQUFRO0lBQUk7QUFDbEQiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXVyYWxpZnQvLi9hcHAvYXBpL3N0cmlwZS1zZXNzaW9uL3JvdXRlLnRzP2IwZTgiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJztcbmltcG9ydCB7IGNyZWF0ZUNoZWNrb3V0U2Vzc2lvbiB9IGZyb20gJ0AvbGliL3N0cmlwZSc7XG5pbXBvcnQgeyBnZXRTZXJ2aWNlU3VwYWJhc2VDbGllbnQgfSBmcm9tICdAL2xpYi9zdXBhYmFzZS1zZXJ2ZXInO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXE6IE5leHRSZXF1ZXN0KSB7XG4gIGNvbnN0IHsgcHJvZ3JhbUlkLCByZWFzb24gfSA9IGF3YWl0IHJlcS5qc29uKCk7XG4gIGlmICghcHJvZ3JhbUlkKSByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ3Byb2dyYW1JZCByZXF1aXJlZCcgfSwgeyBzdGF0dXM6IDQwMCB9KTtcbiAgLy8gRGVyaXZlIHVzZXJJZCBmcm9tIHRoZSBwcm9ncmFtIG93bmVyOyBkbyBub3QgdHJ1c3QgY2xpZW50IGlucHV0XG4gIGNvbnN0IHN1cGFiYXNlID0gZ2V0U2VydmljZVN1cGFiYXNlQ2xpZW50KCk7XG4gIGNvbnN0IHsgZGF0YTogcHJvZ3JhbSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ3Byb2dyYW1zJykuc2VsZWN0KCdpZCx1c2VyX2lkJykuZXEoJ2lkJywgcHJvZ3JhbUlkKS5zaW5nbGUoKTtcbiAgaWYgKGVycm9yIHx8ICFwcm9ncmFtKSByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1Byb2dyYW0gbm90IGZvdW5kJyB9LCB7IHN0YXR1czogNDA0IH0pO1xuICBjb25zdCB1cmwgPSBhd2FpdCBjcmVhdGVDaGVja291dFNlc3Npb24oeyBwcm9ncmFtSWQsIHJlYXNvbjogcmVhc29uID8/ICd1bmxvY2tfZnVsbF9wcm9ncmFtJywgdXNlcklkOiBwcm9ncmFtLnVzZXJfaWQgPz8gdW5kZWZpbmVkIH0pO1xuICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyB1cmwgfSwgeyBzdGF0dXM6IDIwMCB9KTtcbn1cblxuXG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiY3JlYXRlQ2hlY2tvdXRTZXNzaW9uIiwiZ2V0U2VydmljZVN1cGFiYXNlQ2xpZW50IiwiUE9TVCIsInJlcSIsInByb2dyYW1JZCIsInJlYXNvbiIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsInN1cGFiYXNlIiwiZGF0YSIsInByb2dyYW0iLCJmcm9tIiwic2VsZWN0IiwiZXEiLCJzaW5nbGUiLCJ1cmwiLCJ1c2VySWQiLCJ1c2VyX2lkIiwidW5kZWZpbmVkIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/stripe-session/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/stripe.ts":
/*!***********************!*\
  !*** ./lib/stripe.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createCheckoutSession: () => (/* binding */ createCheckoutSession),\n/* harmony export */   stripe: () => (/* binding */ stripe)\n/* harmony export */ });\n/* harmony import */ var stripe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! stripe */ \"(rsc)/./node_modules/stripe/esm/stripe.esm.node.js\");\n\nconst stripe = new stripe__WEBPACK_IMPORTED_MODULE_0__[\"default\"](process.env.STRIPE_SECRET ?? \"\", {\n    apiVersion: \"2024-06-20\"\n});\nasync function createCheckoutSession(opts) {\n    const price = 999;\n    const session = await stripe.checkout.sessions.create({\n        payment_method_types: [\n            \"card\"\n        ],\n        mode: \"payment\",\n        metadata: {\n            programId: opts.programId,\n            reason: opts.reason,\n            userId: opts.userId ?? \"\"\n        },\n        line_items: [\n            {\n                quantity: 1,\n                price_data: {\n                    currency: \"usd\",\n                    unit_amount: price,\n                    product_data: {\n                        name: \"NeuralLift — 12-week program unlock\"\n                    }\n                }\n            }\n        ],\n        success_url: (\"http://localhost:3000\" ?? 0) + `/program/${opts.programId}?checkout=success`,\n        cancel_url: (\"http://localhost:3000\" ?? 0) + `/program/${opts.programId}?checkout=cancelled`\n    });\n    return session.url;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3RyaXBlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE0QjtBQUNyQixNQUFNQyxTQUFTLElBQUlELDhDQUFNQSxDQUFDRSxRQUFRQyxHQUFHLENBQUNDLGFBQWEsSUFBSSxJQUFJO0lBQUVDLFlBQVk7QUFBb0IsR0FBRztBQUVoRyxlQUFlQyxzQkFBc0JDLElBQWtHO0lBQzVJLE1BQU1DLFFBQVE7SUFDZCxNQUFNQyxVQUFVLE1BQU1SLE9BQU9TLFFBQVEsQ0FBQ0MsUUFBUSxDQUFDQyxNQUFNLENBQUM7UUFDcERDLHNCQUFzQjtZQUFDO1NBQU87UUFDOUJDLE1BQU07UUFDTkMsVUFBVTtZQUFFQyxXQUFXVCxLQUFLUyxTQUFTO1lBQUVDLFFBQVFWLEtBQUtVLE1BQU07WUFBRUMsUUFBUVgsS0FBS1csTUFBTSxJQUFJO1FBQUc7UUFDdEZDLFlBQVk7WUFBQztnQkFBRUMsVUFBVTtnQkFBR0MsWUFBWTtvQkFBRUMsVUFBVTtvQkFBT0MsYUFBYWY7b0JBQU9nQixjQUFjO3dCQUFFQyxNQUFNO29CQUFzQztnQkFBRTtZQUFFO1NBQUU7UUFDakpDLGFBQWEsQ0FBQ3hCLHVCQUFnQyxJQUFJLENBQXNCLElBQUssQ0FBQyxTQUFTLEVBQUVLLEtBQUtTLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztRQUMxSFksWUFBWSxDQUFDMUIsdUJBQWdDLElBQUksQ0FBc0IsSUFBSyxDQUFDLFNBQVMsRUFBRUssS0FBS1MsU0FBUyxDQUFDLG1CQUFtQixDQUFDO0lBQzdIO0lBQ0EsT0FBT1AsUUFBUW9CLEdBQUc7QUFDcEIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXVyYWxpZnQvLi9saWIvc3RyaXBlLnRzPzBlMzMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFN0cmlwZSBmcm9tICdzdHJpcGUnO1xuZXhwb3J0IGNvbnN0IHN0cmlwZSA9IG5ldyBTdHJpcGUocHJvY2Vzcy5lbnYuU1RSSVBFX1NFQ1JFVCA/PyAnJywgeyBhcGlWZXJzaW9uOiAnMjAyNC0wNi0yMCcgYXMgYW55IH0pO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlQ2hlY2tvdXRTZXNzaW9uKG9wdHM6IHsgcHJvZ3JhbUlkOiBzdHJpbmc7IHJlYXNvbjogJ3VubG9ja19mdWxsX3Byb2dyYW0nIHwgJ3JlZ2VuZXJhdGVfcHJvZ3JhbSc7IHVzZXJJZD86IHN0cmluZyB9KSB7XG4gIGNvbnN0IHByaWNlID0gOTk5O1xuICBjb25zdCBzZXNzaW9uID0gYXdhaXQgc3RyaXBlLmNoZWNrb3V0LnNlc3Npb25zLmNyZWF0ZSh7XG4gICAgcGF5bWVudF9tZXRob2RfdHlwZXM6IFsnY2FyZCddLFxuICAgIG1vZGU6ICdwYXltZW50JyxcbiAgICBtZXRhZGF0YTogeyBwcm9ncmFtSWQ6IG9wdHMucHJvZ3JhbUlkLCByZWFzb246IG9wdHMucmVhc29uLCB1c2VySWQ6IG9wdHMudXNlcklkID8/ICcnIH0sXG4gICAgbGluZV9pdGVtczogW3sgcXVhbnRpdHk6IDEsIHByaWNlX2RhdGE6IHsgY3VycmVuY3k6ICd1c2QnLCB1bml0X2Ftb3VudDogcHJpY2UsIHByb2R1Y3RfZGF0YTogeyBuYW1lOiAnTmV1cmFsTGlmdCDigJQgMTItd2VlayBwcm9ncmFtIHVubG9jaycgfSB9IH1dLFxuICAgIHN1Y2Nlc3NfdXJsOiAocHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfQkFTRV9VUkwgPz8gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcpICsgYC9wcm9ncmFtLyR7b3B0cy5wcm9ncmFtSWR9P2NoZWNrb3V0PXN1Y2Nlc3NgLFxuICAgIGNhbmNlbF91cmw6IChwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19CQVNFX1VSTCA/PyAnaHR0cDovL2xvY2FsaG9zdDozMDAwJykgKyBgL3Byb2dyYW0vJHtvcHRzLnByb2dyYW1JZH0/Y2hlY2tvdXQ9Y2FuY2VsbGVkYFxuICB9KTtcbiAgcmV0dXJuIHNlc3Npb24udXJsO1xufVxuXG5cbiJdLCJuYW1lcyI6WyJTdHJpcGUiLCJzdHJpcGUiLCJwcm9jZXNzIiwiZW52IiwiU1RSSVBFX1NFQ1JFVCIsImFwaVZlcnNpb24iLCJjcmVhdGVDaGVja291dFNlc3Npb24iLCJvcHRzIiwicHJpY2UiLCJzZXNzaW9uIiwiY2hlY2tvdXQiLCJzZXNzaW9ucyIsImNyZWF0ZSIsInBheW1lbnRfbWV0aG9kX3R5cGVzIiwibW9kZSIsIm1ldGFkYXRhIiwicHJvZ3JhbUlkIiwicmVhc29uIiwidXNlcklkIiwibGluZV9pdGVtcyIsInF1YW50aXR5IiwicHJpY2VfZGF0YSIsImN1cnJlbmN5IiwidW5pdF9hbW91bnQiLCJwcm9kdWN0X2RhdGEiLCJuYW1lIiwic3VjY2Vzc191cmwiLCJORVhUX1BVQkxJQ19CQVNFX1VSTCIsImNhbmNlbF91cmwiLCJ1cmwiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/stripe.ts\n");

/***/ }),

/***/ "(rsc)/./lib/supabase-server.ts":
/*!********************************!*\
  !*** ./lib/supabase-server.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getServiceSupabaseClient: () => (/* binding */ getServiceSupabaseClient)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\nfunction getServiceSupabaseClient() {\n    const url = \"https://ltozsbrlhquklxtvgjrx.supabase.co\";\n    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;\n    if (!url || !serviceKey) {\n        throw new Error(\"Missing Supabase service role env vars\");\n    }\n    return (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(url, serviceKey);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2Utc2VydmVyLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQXFEO0FBRTlDLFNBQVNDO0lBQ2QsTUFBTUMsTUFBTUMsMENBQW9DO0lBQ2hELE1BQU1HLGFBQWFILFFBQVFDLEdBQUcsQ0FBQ0cseUJBQXlCO0lBQ3hELElBQUksQ0FBQ0wsT0FBTyxDQUFDSSxZQUFZO1FBQ3ZCLE1BQU0sSUFBSUUsTUFBTTtJQUNsQjtJQUNBLE9BQU9SLG1FQUFZQSxDQUFDRSxLQUFLSTtBQUMzQiIsInNvdXJjZXMiOlsid2VicGFjazovL25ldXJhbGlmdC8uL2xpYi9zdXBhYmFzZS1zZXJ2ZXIudHM/MDk0ZiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VydmljZVN1cGFiYXNlQ2xpZW50KCkge1xuICBjb25zdCB1cmwgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkw7XG4gIGNvbnN0IHNlcnZpY2VLZXkgPSBwcm9jZXNzLmVudi5TVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZO1xuICBpZiAoIXVybCB8fCAhc2VydmljZUtleSkge1xuICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBTdXBhYmFzZSBzZXJ2aWNlIHJvbGUgZW52IHZhcnMnKTtcbiAgfVxuICByZXR1cm4gY3JlYXRlQ2xpZW50KHVybCwgc2VydmljZUtleSk7XG59XG5cblxuIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsImdldFNlcnZpY2VTdXBhYmFzZUNsaWVudCIsInVybCIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJzZXJ2aWNlS2V5IiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsIkVycm9yIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabase-server.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/@supabase","vendor-chunks/next","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/stripe","vendor-chunks/math-intrinsics","vendor-chunks/es-errors","vendor-chunks/qs","vendor-chunks/call-bind-apply-helpers","vendor-chunks/get-proto","vendor-chunks/object-inspect","vendor-chunks/has-symbols","vendor-chunks/gopd","vendor-chunks/function-bind","vendor-chunks/side-channel","vendor-chunks/side-channel-weakmap","vendor-chunks/side-channel-map","vendor-chunks/side-channel-list","vendor-chunks/hasown","vendor-chunks/get-intrinsic","vendor-chunks/es-object-atoms","vendor-chunks/es-define-property","vendor-chunks/dunder-proto","vendor-chunks/call-bound"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe-session%2Froute&page=%2Fapi%2Fstripe-session%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe-session%2Froute.ts&appDir=%2FUsers%2Fkyler%2FNeuralLift%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fkyler%2FNeuralLift&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();