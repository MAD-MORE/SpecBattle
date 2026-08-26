/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: [{ key: "Accept-CH", value: "Sec-CH-UA-Model, Sec-CH-UA-Platform-Version, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Form-Factors, Device-Memory, DPR, Viewport-Width, Viewport-Height, Downlink, ECT, RTT" }] }];
  },
};
export default nextConfig;
