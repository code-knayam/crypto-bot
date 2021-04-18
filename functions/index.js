const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const axios = require("axios").default;

exports.crypto = functions.pubsub.schedule("*/5 * * * *").onRun(() => {
	console.log("Running job every 5 minutes");
	getCryptoData();
});

function getCryptoData() {
	const baseUrl =
		"https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=74&convert=INR";
	const token = "<api_token>";

	const minThreshold = 5;
	const maxThreshold = 35;

	axios
		.get(baseUrl, {
			headers: {
				"X-CMC_PRO_API_KEY": token,
			},
		})
		.then((res) => {
			const cryptoData = res.data;
			let coinPrice = cryptoData["data"]["74"]["quote"]["INR"]["price"];
			console.log(coinPrice);
			if (coinPrice <= minThreshold) {
				console.log("buy dogecoin");
				sendCryptoData({ type: "buy", price: coinPrice });
			} else if (coinPrice >= maxThreshold) {
				console.log("sell dogecoin");
				sendCryptoData({ type: "sell", price: coinPrice });
			}
		});
}

function sendCryptoData(data) {
	const subjectMapping = {
		buy: "BUY DOGECOIN",
		sell: "SELL DOGECOIN",
	};

	let transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: {
			type: "OAuth2",
			user: "<user_email>",
			clientId: "<client-id>",
			clientSecret: "<client-secret>",
			refreshToken: "<refresh-token>",
			accessToken: "<access-token>",
		},
	});

	let messageOptions = {
		from: "<from_email>",
		to: "<to_email>",
		subject: subjectMapping[data.type],
		html: `<h1>Hi there.</h1> 
			<h4>Action:</h4> <p>${subjectMapping[data.type]}</p><br><br>
			<h4>Current Price:</h4> <p>${data.price}</p>`,
	};

	transporter.sendMail(messageOptions, function (error, info) {
		if (error) {
			throw error;
		} else {
			console.log("Email successfully sent!");
		}
	});
}
