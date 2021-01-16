const axios = require("axios").default;
const tough = require("tough-cookie");
const fs = require("fs");
const qs = require("qs");
const randomUseragent = require("random-useragent");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
axiosCookieJarSupport(axios);
const pLimit = require("p-limit");

const limit = pLimit(10);
const jar = new tough.CookieJar();

const session = axios.create({
  headers: {
    "User-Agent": randomUseragent.getRandom(),
  },
  jar,
  withCredentials: true,
});

let sheet;

const login = () => {
  return session.get(
    "https://www.dell.com/support/order-status/en-us/order-support?lwp=rt"
  );
};

const fuck = async (pdid) => {
  const {
    data: { RedirectUrl },
  } = await session.post(
    "https://www.dell.com/support/order-status/en-us/Home/SearchBy",
    { SearchValue: pdid, SearchBy: "dpid" }
  );

  const { data } = await session.post(
    "https://www.dell.com/support/order-status/en-us/MyOrders/GetContentAsync?" +
      RedirectUrl.split("?")[1]
  );
  const { RedirectUrl: orderStatusUrl } = data;
  if (orderStatusUrl) {
    const {
      data: { OrderPackageDetail },
    } = await session.post(
      "https://www.dell.com/support/order-status/en-us/orderdetails/getorderdetail?" +
        orderStatusUrl.split("?")[1]
    );
    const result = OrderPackageDetail.Packages.map((Package) => {
      fs.appendFileSync("./12.txt", `${pdid}, ${Package.TrackingId}\n`);
      return [pdid, Package.TrackingId];
    });
    console.log(1, result);
    return result;
  }
  const orders = data.OrderCollectionData.OrderCollection.CardList;
  const result = orders
    .map((order) => {
      if (!order.TrackOrderLink) return;
      const { tracknumbers } = qs.parse(order.TrackOrderLink.Url);
      fs.appendFileSync("./12.txt", `${pdid}, ${tracknumbers}\n`);
      return [pdid, tracknumbers];
    })
    .filter((tracknumbers) => tracknumbers);
  console.log(2, result);
  return result;
};

const run = async () => {
  await login();
  const qq = fs.readFileSync("./1.txt");
  const pdids = qq.toString().split("\n");
  pdids.map((id) => {
    limit(() => fuck(id));
  });
};

run();
