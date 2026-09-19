// A stylesheet imported by package specifier. The site's package.json lists
// the package as a dependency, which compileJSX marks external — without
// cssPackagePlugin this import would be left in the JS and no CSS emitted.
import "@test-site/css-package/style.css";

export const meta = { title: "Package CSS" };

export default function PackageCss() {
  return <h1 class="from-package">Package CSS Test</h1>;
}
