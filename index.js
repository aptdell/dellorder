const axios = require("axios").default;
const tough = require("tough-cookie");
const fs = require("fs");
const qs = require("qs");
const randomUseragent = require("random-useragent");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
axiosCookieJarSupport(axios);
const pLimit = require("p-limit");

const limit = pLimit(10);

const session = axios.create({
  headers: {
    origin: "https://www.dell.com",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
    accept: "application/json, text/plain, */*",
    "accept-encoding": "gzip, deflate",
    "cache-control": "no-cache",
    referer: "https://www.dell.com/support/order-status/en-us/order-support",
    Connection: "keep-alive",
    cookie:
      'eSupId=SID=a96fca54-cc91-461a-8c3f-726bfb298c15&ld=20210603; lwp=c=us&l=en&cs=04&s=bsd; s_ecid=MCMID%7C34306354502668307090253326355457924185; _cls_v=81c79680-d2c2-49f8-84fd-51557ef068c7; _evidon_consent_cookie={"consent_date":"2020-12-03T06:59:48.850Z","categories":{"64":true},"vendors":{"64":{"14":true,"17":true,"31":true,"36":true,"38":true,"41":true,"53":true,"56":true,"60":true,"63":true,"64":true,"66":true,"80":true,"81":true,"82":true,"84":true,"92":true,"99":true,"103":true,"111":true,"117":true,"128":true,"131":true,"134":true,"139":true,"168":true,"242":true,"243":true,"249":true,"253":true,"257":true,"259":true,"269":true,"280":true,"290":true,"293":true,"307":true,"322":true,"348":true,"355":true,"384":true,"395":true,"442":true,"447":true,"457":true,"467":true,"480":true,"516":true,"517":true,"532":true,"560":true,"564":true,"608":true,"611":true,"631":true,"635":true,"674":true,"683":true,"718":true,"728":true,"827":true,"828":true,"831":true,"868":true,"905":true,"920":true,"933":true,"937":true,"942":true,"948":true,"1028":true,"1061":true,"1095":true,"1157":true,"1175":true,"1256":true,"1267":true,"1272":true,"1410":true,"1412":true,"1463":true,"1647":true,"1697":true,"1727":true,"1879":true,"1896":true,"2088":true,"2149":true,"2197":true,"2230":true,"2492":true,"2516":true,"2521":true,"2536":true,"2937":true,"3017":true,"3043":true,"3320":true,"3490":true,"3944":true,"3993":true,"3994":true,"4067":true,"4490":true,"4673":true,"4902":true,"5027":true,"5122":true,"5304":true,"5385":true,"6128":true}},"cookies":{"64":true},"consent_type":1}; dais-c=enaVxm2P6USA1V5tWNkvmRUFrSA9Hb6KCBp3HAeh8H0OV+CwZzpSHjBOrKXoynaH; bmgvid="dae39872-ee62-4db0-ad5a-b05d89944cf3"; TLGUID=34306354502668307090253326355457924185; DellCEMSession=1B5A2A5F92F33CF20C9408F12CFAAA44; dell_canary=live; AKA_A2=A; bm_sz=2057672E8F1D0140B309F53B7D38A8E9~YAAQTDArF0dWb8p2AQAAsygGzAos9BjxQkDAXbYARMYcBJySdAy2DS8HZ9wzCfuJHb+MqcQ11uIaY2t9u+yiaihah2YqX8AzNrhLFj/SiiC6ScFCIQEj/jmFLKH5Ia+yrZ7B9/uWlH1w8IMgmcTZDDsz9qSbWnPHDZI3e09Wl1VEzLes3/jtlu7R+fXTag==; _abck=948E4B884CAC65DCC9CF89CD5990CB78~0~YAAQTDArF3tWb8p2AQAAHy0GzAXzgwfDLhRmoRj57Cish2tFIl+VbO1TfGExli+gM2CFJfETRxIdLR1b8i7m4lYcqlzzlcAhoFE1xRSG27Q8t6KJe9tCX+DKFtmbz+rpPsdKKo0ZUe7XQz88femzq9lr53a9jPpON/afFTW670i3Pya6cW1yfYm+2rDCYE5Ll0DfXJ3tvq0VaSXxRjnyk9DODJgNNzkLvyenaM9Z9fO6GeGPK4gXP8hVZJc42g9IzWeS3q/YmDWMHj1G0QC6QGpsITUAPAVXV8uI83yB3fS4gD+s7ermE0d50BuvIc7RCQUHrRB0HBVKktcRxCCzC6LWkMo=~-1~-1~-1; bm_mi=1BB237F982331CD10F793446344B748A~jKrqTCBnmOlC2rCeW6U2xztg2yxmdJlLQ9b5CVolkIPs0qIGTH6rLyx4RcRMome4rkDwl1ecvdhDjUli3atDVAEFFZFSBxzrtZJSkNZNcWIjq/vyZaRe89Nl/c2Bydna+5eYMn51DSBHQPeUnhRhGvvqGV/b+QMgoDqEDFK3uHqawSihgpMo0PVzHUvC0lZJyChtdaB8bBEKzrsBpJ/4OxrsxlDXJhmOd8pfAPfS3D6gjigpjm9DFjJV2HPOa5BNKuVgNbvDAoAzaMCZ/09eqIGNBArUlJ1jxUcMk45yjCA=; ak_bmsc=69E4E614F747230ECD33991C21325428172B304CFD700000B4B1F25F8FA3F23B~plbQEYoRRMwce8fdSweH+OePJgIhdglwUvUZYfTrORXdKBfURdEQNvvp2mUuPq/0W3wAjmrT08gGvXrI5QlKO4NQYtwiGWSYKRYlvLq3jNdYdEOivRAZ96XcvWuZo8GtOeOeEf0dmzzoZUcvDVsqQQKYYQo+ZKH7i3i+07c6JNhUhiOJMvJHPnjqu2wCt75/lyb85PbVqkUjO5Jh/qK6AMu5nUpBjqK9AEREy9tY6xBo4ukLmFf/EJqH8BWkRPjvUW; AMCVS_4DD80861515CAB990A490D45%40AdobeOrg=1; AMCV_4DD80861515CAB990A490D45%40AdobeOrg=1585540135%7CMCIDTS%7C18632%7CMCMID%7C34306354502668307090253326355457924185%7CMCAAMLH-1610345809%7C11%7CMCAAMB-1610345809%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1609748209s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C4.4.0; rumCki=false; VOCAAS_SESSION_ID=974F630C4C032A94C59897D561110CB8; VOCAAS_STICKY_SESSION=974F630C4C032A94C59897D561110CB8; s_c49=c%3Dus%26l%3Den%26s%3Dbsd%26cs%3D04; gpv_pn=us%7Cen%7Cbsd%7C04%7Cesupport-orderstatus%7Chome%7Cindex; s_ips=1066; cidlid=%3A%3A; s_vnc365=1641277010883%26vn%3D3; s_ivc=true; s_cc=true; _cls_s=b1cc6a11-6934-4847-84e3-a8f2d2feaf0d:1; ipe_s=e48b2a4d-9e9e-a39b-5f9a-c24ed1d2f03e; ipe.184.pageViewedCount=1; ipe.184.pageViewedDay=4; s_ppv=us%257Cen%257Cbsd%257C04%257Cesupport-orderstatus%257Chome%257Cindex%2C41%2C41%2C1066%2C1%2C2; RT="z=1&dm=dell.com&si=1204faf5-967b-47f0-90c5-c25aa476eede&ss=kji62d80&sl=5&tt=aoq&ld=y09t"; akavpau_maintenance_vp=1609742612~id=8606c4bcd860e0bdfb23a6e5fa5e0016; bm_sv=1D0CD9523F03DD71226DF10CABAD637A~pdxIb3XKJYG7HJvdAZgJsVshpvny4ejC8xgOnMwoZ8W7bFmL+DaGAwa9/NaaghdeE0p1hhbvSi8ORyD0FwIzfLmjZkLa8do3QfFZ1Pb5RddaRW6vKYjodemVSgyb2mhgCZRF+Axd5seuCIs9rM031w==; ipe_184_fov=%7B%22numberOfVisits%22%3A1%2C%22sessionId%22%3A%22e48b2a4d-9e9e-a39b-5f9a-c24ed1d2f03e%22%2C%22expiry%22%3A%222021-02-03T06%3A38%3A11.192Z%22%2C%22lastVisit%22%3A%222021-01-04T06%3A38%3A33.012Z%22%7D; s_tp=2606; s_sq=%5B%5BB%5D%5D',
  },
});

const fuck = async (pdid) => {
  try {
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
  } catch (error) {
    console.log("========error==========");
    console.log(error);
    console.log("========error==========");
  }
};

const run = async () => {
  const qq = fs.readFileSync("./1.txt");
  const pdids = qq.toString().split("\n");
  pdids.map((id) => {
    limit(() => fuck(id));
  });
};

run();
