"use strict"

const qs = require('querystring')
const _ = require('lodash')

const guilds = require('../lib/guilds');
const emblem = require('../lib/emblem2.js');

module.exports = function (req, res) {
	const renderStart = Date.now()

	const guildName = req.params.guildName.replace(/-/g, ' ');
	const size = req.params.size;
	const bgColor = req.params.bgColor;


	guilds.getByName(guildName, __returnGuildEmblem);


	function __returnGuildEmblem(err, data){
		if(data && data.guild_name){
			const guildNameUrl = data.guildNameUrl = qs.escape(data.guild_name.replace(/ /g, '-'));

			let svgPath = [size];
			if(bgColor){svgPath.push(bgColor);}
			svgPath.push('svg');

			const canonical = [
				'',
				'guilds',
				guildNameUrl,
				svgPath.join('.')
			].join('/');

			if(req.url !== canonical){
				res.redirect(301, canonical);
			}
			else{
				emblem.draw(data.emblem, size, bgColor || 'transparent', function(svg){
					require('zlib').gzip(svg, function (err, data) {

						res.writeHead(200, {
							'Content-Type': 'image/svg+xml',
							'Content-Encoding': 'gzip',
							'Cache-Control': 'public, max-age=86400',
							'Expires': new Date(Date.now() + 86400000).toUTCString(),
						});
						res.end(data);
						
						svg = null;
						data = null;
					});

				});
			}
		}
		else{
			res.send(404, 'Sorry, we cannot find guild named ' + guildName);
		}


	}


};