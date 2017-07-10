import { View } from "tns-core-modules/ui/core/view/view";

declare namespace JSX {
    interface Element extends View { }

    interface ElementClass extends Object { }
    interface ElementAttributesProperty {
        /**
         * Specify the property used to resolve attribute typings.
         */
        props: {};
    }

    interface IntrinsicElements {
        // HTML
        page: SurplusAtributes<any>;
        buttonx: SurplusAtributes<any>;
    }

    interface SurplusAtributes<T> {
        ref?: T;
    }

}