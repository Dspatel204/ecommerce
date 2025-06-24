import {
  Frame,
  ColorPicker,
  Button,
  Modal,
  InlineGrid,
  BlockStack,
  Checkbox,
  Box,
  Text,
  ChoiceList,
  DropZone,
  Thumbnail,
  Toast,
  TextField,
  Card,
  Link,
  Badge,
  ContextualSaveBar,
  RangeSlider,
  Tooltip,
  Spinner,
  Icon,
} from "@shopify/polaris";
import React, { useEffect, useRef, useState } from "react";
import "./assets/css/customise.css";
import { NoteMinor, DeleteIcon, DeleteMinor } from "@shopify/polaris-icons";
import { SVG_ICON } from "./SVG_ICON";
import poweredByImage from "./assets/image/poered_by.png";
import { json, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import config from "./config";
import { SHOULD_AUTOBATCH } from "@reduxjs/toolkit";

const HSLtoRGBConverter = (h, s, l, a) => {
  // Ensure h is between 0 and 360, and s and l are between 0 and 1
  h = Math.max(0, Math.min(360, h));
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  a = Math.max(0, Math.min(1, a));

  // Formula for HSL to RGB conversion
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r, g, b;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  // Adjust values and convert to 8-bit integers
  const rgba = {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a: a,
  };

  return rgba;
};
let clicks = 1;
let addsectionquan = 3;

const Customise = ({ not }) => {
  // classlist ma active hoy te display block and other wise none in js
  const [active, setActive] = useState(false);
  // const [clicks, setclicks] = useState(1);
  const section = clicks;
  const [menu, setmenu] = useState();
  const [allSections, setallSections] = useState([section]);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [bordercolorPickerVisible, setbordercolorPickerVisible] =
    useState(false);
  const [iconcolorPickerVisible, seticoncolorPickerVisible] = useState(false);
  const [textcolorPickerVisible, settextcolorPickerVisible] = useState(false);
  const [cartcountercolorPickerVisible, setcartcountercolorPickerVisible] =
    useState(false);
  const [
    cartcountertextcolorPickerVisible,
    setcartcountertextcolorPickerVisible,
  ] = useState(false);
  const [openlinkcheckbox, setopenlinkcheckbox] = useState(false);
  const [enablecartcounter, setenablecartcounter] = useState(false);
  const [menucheckbox, setmenucheckbox] = useState(true);
  const [drag, setdrag] = useState(false);
  const [borderColor, setBorderColor] = useState("rgb(255, 255, 255)");
  const [selectedColor, setSelectedColor] = useState("rgb(255, 255, 255)");
  const [IconColor, setIconColor] = useState("rgb(255, 255, 255)");
  const [TextColor, setTextColor] = useState("rgb(255, 255, 255)");
  const [palntype, setpalntype] = useState("Free");
  const [iconsize, setIconsize] = useState("20");
  const [Textsize, setTextsize] = useState("20");
  const [storeuserid, setstoreuserid] = useState("");
  const freeiconskey = [1, 3, 5, 17, 21, 23, 33, 35, 157, 51, 55, 57, 81, 91];
  const [visible, setVisible] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [loading, setloading] = useState(false);
  function updatergbacolor() {
    const rgbaColor = HSLtoRGBConverter(
      selectedColor.hue,
      selectedColor.saturation,
      selectedColor.brightness,
      selectedColor.alpha
    );
    const rgbaborder = HSLtoRGBConverter(
      borderColor.hue,
      borderColor.saturation,
      borderColor.brightness,
      borderColor.alpha
    );
    const rgbaIcon = HSLtoRGBConverter(
      IconColor.hue,
      IconColor.saturation,
      IconColor.brightness,
      IconColor.alpha
    );
    const rgbaText = HSLtoRGBConverter(
      TextColor.hue,
      TextColor.saturation,
      TextColor.brightness,
      TextColor.alpha
    );
    const rgbacart = HSLtoRGBConverter(
      cartColor.hue,
      cartColor.saturation,
      cartColor.brightness,
      cartColor.alpha
    );
    const rgbacarttext = HSLtoRGBConverter(
      countertextcolor.hue,
      countertextcolor.saturation,
      countertextcolor.brightness,
      countertextcolor.alpha
    );
    console.log(rgbacart, "49");
    const getrgbStyle = `rgba(${rgbaColor.r}, ${rgbaColor.g}, ${rgbaColor.b}, ${rgbaColor.a})`;
    const getrgbacart = `rgba(${rgbacart.r}, ${rgbacart.g}, ${rgbacart.b}, ${rgbacart.a})`;
    const getrgbacarttext = `rgba(${rgbacarttext.r}, ${rgbacarttext.g}, ${rgbacarttext.b}, ${rgbacarttext.a})`;
    const getrgbbordercolor = `rgba(${rgbaborder.r}, ${rgbaborder.g}, ${rgbaborder.b}, ${rgbaborder.a})`;
    const getrgbiconcolor = `rgba(${rgbaIcon.r}, ${rgbaIcon.g}, ${rgbaIcon.b}, ${rgbaIcon.a})`;
    const getrgbtextcolor = `rgba(${rgbaText.r}, ${rgbaText.g}, ${rgbaText.b}, ${rgbaText.a})`;
    setrgbStyle(getrgbStyle);
    setcartcountercolor(getrgbacart);
    setrgbbordercolor(getrgbbordercolor);
    setcartcountertextcolor(getrgbacarttext);
    setrgbiconcolor(getrgbiconcolor);
    setrgbtextcolor(getrgbtextcolor);
  }
  const [rgbStyle, setrgbStyle] = useState("");
  const [rgbbordercolor, setrgbbordercolor] = useState("");
  const [rgbiconcolor, setrgbiconcolor] = useState("");
  const [cartcountercolor, setcartcountercolor] = useState("");
  const [cartcountertextcolor, setcartcountertextcolor] = useState("");
  const [rgbtextcolor, setrgbtextcolor] = useState("");
  const [cartColor, setcartColor] = useState("");
  const [countertextcolor, setcountertextcolor] = useState("");
  const customiconcolorstyle = `
    .nav-grid-icon svg{
      fill:${rgbiconcolor}
    }
  `;
  const customiseiconsize = `
  .nav-grid-icon svg {
    width:${iconsize}px !important;
    height:${iconsize}px !important;
  }
  .nav-grid .Polaris-Thumbnail--sizeMedium{
    width:${iconsize}px !important;
    height:${iconsize}px !important;
  }
  .nav-grid-icon span{
    font-size:${Textsize}px !important;
  }
  .nav-grid span{
    font-size:${Textsize}px !important;
  }
  `;
  const [SelectedIcons, setSelectedIcons] = useState({
    Menu1Icon: "",
    Menu2Icon: "",
    Menu3Icon: "",
    Menu4Icon: "",
    Menu5Icon: "",
    Menu6Icon: "",
  });
  const [SelectedImage, setSelectedImage] = useState({
    Menu1Image: "",
    Menu2Image: "",
    Menu3Image: "",
    Menu4Image: "",
    Menu5Image: "",
    Menu6Image: "",
  });
  const [selected, setSelected] = useState(["Icon"]);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [Customcssvalue, setCustomcssvalue] = useState("");
  const [namevalue, setNamevalue] = useState({
    namevalue1: "",
    namevalue2: "",
    namevalue3: "",
    namevalue4: "",
    namevalue5: "",
    namevalue6: "",
  });
  const [linkvalue, setLinkvalue] = useState({
    linkvalue1: "",
    linkvalue2: "",
    linkvalue3: "",
    linkvalue4: "",
    linkvalue5: "",
    linkvalue6: "",
  });
  const [idvalue, setIdvalue] = useState({
    idvalue1: "",
    idvalue2: "",
    idvalue3: "",
    idvalue4: "",
    idvalue5: "",
    idvalue6: "",
  });
  const [classvalue, setClassvalue] = useState({
    classvalue1: "",
    classvalue2: "",
    classvalue3: "",
    classvalue4: "",
    classvalue5: "",
    classvalue6: "",
  });
  const [linkcheckboxes, setlinkcheckboxes] = useState({
    linkcheckbox1: false,
    linkcheckbox2: false,
    linkcheckbox3: false,
    linkcheckbox4: false,
    linkcheckbox5: false,
    linkcheckbox6: false,
  });
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const [uploadFiles, setUploadFiles] = useState();
  const [activeContent, setActiveContent] = useState("content1");
  const [activeIcon, setActiveIcon] = useState(0);
  const [initialValuess, setInitialValues] = useState({
    icon_type: "",
    show_text: "1",
    background_color: "#fff",
    border_color: "#000",
    icon_color: "#000",
    text_color: "#000",
    menu1: {
      icon: "3",
      image: "sd",
      name: "Shop",
      link: "/collections/all",
      link_action: "0",
    },
    menu2: {
      icon: "33",
      image: "",
      name: "Cart",
      link: "/cart",
      link_action: "0",
    },
    menu3: {
      icon: "51",
      image: "",
      name: "Account",
      link: "/account",
      link_action: "0",
    },
    menu4: { icon: "", image: "", name: "", link: "", link_action: "0" },
    menu5: { icon: "", image: "", name: "", link: "", link_action: "0" },
    menu6: { icon: "", image: "", name: "", link: "", link_action: "0" },
    custom_css: "",
    status: "1",
  });
  const [getimage, setgetimage] = useState("");
  const [upgradelink, setupgradeLink] = useState("");
  const [noticevisible, setNoticevisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setNoticevisible(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [noticevisible]);

  useEffect(() => {
    return async () => {
      const { data } = await axios.get(
        `${config.api_endpoint}/customise/campaigns/list?shop=${config.shop_name}`
      );
      const getplan = await axios.get(
        `${config.api_endpoint}/dashboard/shop/app/status?shop=${config.shop_name}`
      );
      console.log(getplan, "6532");
      console.log(data, "452");
      if (data.status) {
        setloading(true);
      }
      setstoreuserid(data.data[0].store_user_id);
      setSelectedColor(data.data[0].background_color);
      setrgbbordercolor(data.data[0].border_color);
      setrgbiconcolor(data.data[0].icon_color);
      setrgbStyle(data.data[0].background_color);
      setrgbtextcolor(data.data[0].text_color);
      setCustomcssvalue(data.data[0].custom_css);

      const geticons = {};
      const getimages = {};
      const getnamevalue = {};
      const getlinkvalue = {};
      const showmenu = [];
      for (let index = 1; index <= 6; index++) {
        geticons[`Menu${index}Icon`] = JSON.parse(
          data.data[0][`menu${index}`]
        ).icon;
        showmenu.push(JSON.parse(data.data[0][`menu${index}`]).icon && clicks);
        getimages[`Menu${index}Image`] = JSON.parse(
          data.data[0][`menu${index}`]
        ).image;
        getnamevalue[`namevalue${index}`] = JSON.parse(
          data.data[0][`menu${index}`]
        ).name;
        getlinkvalue[`linkvalue${index}`] = JSON.parse(
          data.data[0][`menu${index}`]
        ).link;
        console.log(
          JSON.parse(data.data[0][`menu${index}`]).icon !== "",
          "5962"
        );
      }
      setgetimage(JSON.parse(data.data[0][`menu1`]).image);
      console.log(
        JSON.parse(data.data[0][`menu1`]).image,
        JSON.parse(data.data[0][`menu2`]).image,
        JSON.parse(data.data[0][`menu3`]).image,
        JSON.parse(data.data[0][`menu4`]).image,
        "5+62"
      );
      setallSections([1, 2, 3]);
      clicks = 3;
      setSelectedIcons((prevIcons) => ({ ...prevIcons, ...geticons }));
      setSelectedImage((prevImages) => ({ ...prevImages, ...getimages }));
      setNamevalue((prevname) => ({ ...prevname, ...getnamevalue }));
      setLinkvalue((prevLink) => ({ ...prevLink, ...getlinkvalue }));
      console.log(data.data[0].app_plan, "46512");
      setpalntype(data.data[0].app_plan === "0" ? "Free" : "paid");
      addsectionquan = data.data[0].app_plan === "0" ? 3 : 6;
    };
  }, []);

  const handleIconClick = (target, index) => {
    setActiveContent(target);
    setActiveIcon(index);
  };

  const Navigate = useNavigate();
  useEffect(() => {
    if (not) {
      Navigate("/customise", { config });
    }
  }, [Navigate]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [visible]);

  const handleChange = (value) => setSelected(value);

  function toggleAccordion(event) {
    const itemToggle = event?.currentTarget;
    const itemTap = itemToggle.nextElementSibling; // Assuming .tab-at is the immediate sibling

    itemToggle.classList.toggle("active");

    if (itemToggle.classList.contains("active")) {
      itemTap.style.display = "block";
    } else {
      itemTap.style.display = "none";
    }
  }

  useEffect(() => {
    if (selected[0] === "Image") {
      setSelectedIcons({
        Menu1Icon: "",
        Menu2Icon: "",
        Menu3Icon: "",
        Menu4Icon: "",
        Menu5Icon: "",
        Menu6Icon: "",
      });
    }
  }, [selected]);

  const onSubmit = () => {
    console.log(initialValuess, "84565");
  };

  const toggleActive = (clickedmenu) => {
    setActive((active) => !active);
    setmenu(clickedmenu);
  };

  const handleaddsection = () => {
    clicks += 1;
    setallSections((prev) => [...prev, clicks]);
  };

  const handleicon = (key, id) => {
    const updatedIcon = {
      ...SelectedIcons,
      [`${menu}`]: key,
    };
    console.log(updatedIcon, "451");
    setSelectedIcons(updatedIcon);
    toggleActive();
  };

  const handleremoveicon = (item, index) => {
    const updatedIcon = {
      ...SelectedIcons,
      [`Menu${item}Icon`]: "",
    };
    setSelectedIcons(updatedIcon);
  };

  const handleremoveimage = (item, index) => {
    console.log(item, index, SelectedImage, "image");
    const updatedImage = {
      ...SelectedImage,
      [`Menu${item}Image`]: "",
    };
    setSelectedImage(updatedImage);
  };

  const handleDropZoneDrop = (acceptedFiles, rejectedFiles, menu) => {
    setSelectedImage({
      ...SelectedImage,
      [`${menu}`]: acceptedFiles[0]["name"],
    });
    setUploadFiles(acceptedFiles[0]);
    const isValidImage =
      acceptedFiles.length > 0 &&
      validImageTypes.includes(acceptedFiles[0].type);
    if (!isValidImage) {
      setVisible(true);
      setRejectedFiles((prevRejected) => [...prevRejected, acceptedFiles[0]]);
      return;
    }
  };

  const validImageTypes = ["image/gif", "image/jpeg", "image/png"];

  const handleColorChange = (color) => {
    console.log(rgbStyle, "456620");
    setSelectedColor(color);
    updatergbacolor();
  };
  const handlecarttextChange = (color) => {
    setcountertextcolor(color);
    updatergbacolor();
  };

  console.log(rgbStyle, "4566+9++");
  const handleButtonClick = () => {
    setColorPickerVisible(!colorPickerVisible);
    setbordercolorPickerVisible(false);
    settextcolorPickerVisible(false);
    seticoncolorPickerVisible(false);
    setcartcountercolorPickerVisible(false);
    setcartcountertextcolorPickerVisible(false);
  };

  const handleBordercolor = () => {
    setbordercolorPickerVisible(!bordercolorPickerVisible);
    setColorPickerVisible(false);
    seticoncolorPickerVisible(false);
    settextcolorPickerVisible(false);
    setcartcountercolorPickerVisible(false);
    setcartcountertextcolorPickerVisible(false);
  };

  const handleIconcolor = () => {
    seticoncolorPickerVisible(!iconcolorPickerVisible);
    setbordercolorPickerVisible(false);
    setColorPickerVisible(false);
    settextcolorPickerVisible(false);
    setcartcountertextcolorPickerVisible(false);
    setcartcountercolorPickerVisible(false);
  };

  const handletextcolor = () => {
    settextcolorPickerVisible(!textcolorPickerVisible);
    setbordercolorPickerVisible(false);
    seticoncolorPickerVisible(false);
    setColorPickerVisible(false);
    setcartcountercolorPickerVisible(false);
    setcartcountertextcolorPickerVisible(false);
  };

  const handleborderColorChange = (color) => {
    setBorderColor(color);
    updatergbacolor();
  };

  const handleiconColorChange = (color) => {
    setIconColor(color);
    updatergbacolor();
  };

  const handletextColorChange = (color) => {
    setTextColor(color);
    updatergbacolor();
  };
  const handlecartColorChange = (color) => {
    setcartColor(color);
    updatergbacolor();
  };

  const handleCheckbox = (item) => {
    // setopenlinkcheckbox(!openlinkcheckbox);
    const updatedCheckbox = {
      ...linkcheckboxes,
      [`linkcheckbox${item}`]: true,
    };
    setlinkcheckboxes(updatedCheckbox);
  };

  const handlemenucheckbox = () => {
    setmenucheckbox(!menucheckbox);
  };

  const handledeletemenu = (menu, id) => {
    console.log("first", menu);
    const updatedIcon = {
      ...SelectedIcons,
      [menu]: "",
    };
    setSelectedImage((prevImages) => ({
      ...prevImages,
      [`Menu${id + 1}Image`]: "",
    }));
    setNamevalue((prevname) => ({ ...prevname, [`namevalue${id + 1}`]: "" }));
    setLinkvalue((prevLink) => ({ ...prevLink, [`linkvalue${id + 1}`]: "" }));
    setSelectedIcons(updatedIcon);
    const newsection = [...allSections];
    newsection.splice(id, 1);
    setallSections(newsection);
  };
  const handleSort = () => {
    const newArray = [...allSections];
    const [draggedItem] = newArray.splice(dragItem.current, 1);
    newArray.splice(dragOverItem.current, 0, draggedItem);

    // Update the state with the new order
    setallSections(newArray);

    // Update SelectedIcons based on the new order
    const newSelectedIcons = {};
    newArray.forEach((item, index) => {
      const menuNumber = item;
      const iconKey = `Menu${menuNumber}Icon`;
      newSelectedIcons[iconKey] = SelectedIcons[iconKey];
    });
    setSelectedIcons(newSelectedIcons);
    const newSelectedImages = {};
    newArray.forEach((item, index) => {
      const menuNumber = item;
      const iconKey = `Menu${menuNumber}Image`;
      newSelectedImages[iconKey] = SelectedImage[iconKey];
    });
    setSelectedImage(newSelectedImages);
    const newSelectedname = {};
    newArray.forEach((item, index) => {
      const menuNumber = item;
      const iconKey = `namevalue${menuNumber}`;
      newSelectedname[iconKey] = namevalue[iconKey];
    });
    setNamevalue(newSelectedname);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleSave = async () => {
    console.log("44546541save");
    setUnsavedChanges(false);
    // const formdata = new FormData();
    // formdata.append("image", uploadFiles);
    const postdata = {
      icon_type: selected[0],
      show_text: menucheckbox,
      background_color: rgbStyle,
      border_color: rgbbordercolor,
      icon_color: rgbiconcolor,
      text_color: rgbtextcolor,
      menu1: {
        icon: SelectedIcons.Menu1Icon,
        image: SelectedImage.Menu1Image,
        id: idvalue.idvalue1,
        extraclass: classvalue.classvalue1,
        name: namevalue.namevalue1,
        link: linkvalue.linkvalue1,
        link_action: linkcheckboxes.linkcheckbox1,
        enable_cart_counter: 0,
      },
      menu2: {
        icon: SelectedIcons.Menu2Icon,
        image: SelectedImage.Menu2Image,
        name: namevalue.namevalue2,
        link: linkvalue.linkvalue2,
        id: idvalue.idvalue2,
        extraclass: classvalue.classvalue2,
        link_action: linkcheckboxes.linkcheckbox2,
      },
      menu3: {
        icon: SelectedIcons.Menu3Icon,
        image: SelectedImage.Menu3Image,
        name: namevalue.namevalue3,
        id: idvalue.idvalue3,
        extraclass: classvalue.classvalue3,
        link: linkvalue.linkvalue3,
        link_action: linkcheckboxes.linkcheckbox3,
      },
      menu4: {
        icon: SelectedIcons.Menu4Icon,
        image: SelectedImage.Menu4Image,
        name: namevalue.namevalue4,
        id: idvalue.idvalue4,
        extraclass: classvalue.classvalue4,
        link: linkvalue.linkvalue4,
        link_action: linkcheckboxes.linkcheckbox4,
      },
      menu5: {
        icon: SelectedIcons.Menu5Icon,
        image: SelectedImage.Menu5Image,
        name: namevalue.namevalue5,
        id: idvalue.idvalue5,
        extraclass: classvalue.classvalue5,
        link: linkvalue.linkvalue5,
        link_action: linkcheckboxes.linkcheckbox5,
      },
      menu6: {
        icon: SelectedIcons.Menu6Icon,
        image: SelectedImage.Menu6Image,
        name: namevalue.namevalue6,
        id: idvalue.namevalue6,
        extraclass: classvalue.classvalue6,
        link: linkvalue.linkvalue6,
        link_action: linkcheckboxes.linkcheckbox6,
      },
      custom_css: Customcssvalue,
      status: "1",
    };
    console.log(namevalue.namevalue1, "56", SelectedImage.Menu1Image);
    const postapi = await axios.post(
      `${config.api_endpoint}/customise/campaigns/update/69297471779?shop=${config.shop_name}`,
      postdata
    );
    console.log(postapi.status, "569");
    if (postapi.status === "200") {
      setVisible(true);
    }

    console.log(postapi, "465");
    console.log(postdata, "45");
  };

  const handleDiscard = () => {
    console.log("first");
    /* setNamevalue({
      ...namevalue,
      namevalue1: "",
      namevalue2: "",
      namevalue3: "",
      namevalue4: "",
      namevalue5: "",
      namevalue6: "",
    });
    setLinkvalue({
      ...linkvalue,
      linkvalue1: "",
    }); */
    const getnamevalue = {};
    const getlinkvalue = {};
    for (let index = 1; index <= 6; index++) {
      getnamevalue[`namevalue${index}`] = "";
      getlinkvalue[`linkvalue${index}`] = "";
    }
    setNamevalue((prevname) => ({
      ...prevname,
      namevalue1: "shop",
      namevalue2: "cart",
      namevalue3: "account",
      namevalue4: getnamevalue.namevalue4,
      namevalue5: getnamevalue.namevalue5,
      namevalue6: getnamevalue.namevalue6,
    }));
    setLinkvalue((prevLink) => ({
      ...prevLink,
      namevalue1: "/collections/all",
      namevalue2: "/cart",
      namevalue3: "/account",
      namevalue4: getnamevalue.linkvalue4,
      namevalue5: getnamevalue.linkvalue5,
      namevalue6: getnamevalue.linkvalue6,
      ...getlinkvalue,
    }));
  };
  const handleupgrade = async () => {
    const data = await axios.get(
      `${config.api_endpoint}/plan/app/upgrade?shop=${config.shop_name}`
    );
    setupgradeLink(data.data.redirect_url);
    window.open(data.data.redirect_url);
    console.log(data, ";;");
  };

  return (
    <div>
      <style>{(customiconcolorstyle, customiseiconsize)}</style>
      <Frame>
        {visible ? <Toast content="your details saved successfully" /> : null}
        {loading ? (
          <React.Fragment>
            {unsavedChanges && (
              <ContextualSaveBar
                alignContentFlush
                message="Unsaved changes"
                fullWidth
                saveAction={{
                  onAction: handleSave,
                  content: "Save",
                }}
                discardAction={{
                  onAction: handleDiscard,
                  content: "Discard",
                }}
              ></ContextualSaveBar>
            )}
            {console.log(rgbStyle, "465+++")}
            <div className="wrapper">
              <div className="sidebar-wrapper">
                <div className="sidebar-content">
                  <div className="sidebar-settingbar">
                    <ul className="settingbar-menu icons">
                      <li>
                        <button
                          className={`store-design-icon store-icon ${
                            1 === activeIcon && active
                          }`}
                          onClick={() => handleIconClick("content1", 1)}
                          data-target="content1"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            className=""
                            width="24px"
                            height="24px"
                            focusable="false"
                            aria-hidden="true"
                          >
                            <path d="M3.5 5.25c0-.966.784-1.75 1.75-1.75h1a.75.75 0 0 1 0 1.5h-1a.25.25 0 0 0-.25.25v1a.75.75 0 0 1-1.5 0v-1Z"></path>
                            <path
                              fillRule="evenodd"
                              d="M3.5 9.25c0-.966.784-1.75 1.75-1.75h9.5c.966 0 1.75.784 1.75 1.75v1.5a1.75 1.75 0 0 1-1.75 1.75h-9.5a1.75 1.75 0 0 1-1.75-1.75v-1.5Zm1.75-.25a.25.25 0 0 0-.25.25v1.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25v-1.5a.25.25 0 0 0-.25-.25h-9.5Z"
                            ></path>
                            <path d="M3.5 14.75c0 .966.784 1.75 1.75 1.75h1a.75.75 0 0 0 0-1.5h-1a.25.25 0 0 1-.25-.25v-1a.75.75 0 0 0-1.5 0v1Z"></path>
                            <path d="M14.75 3.5c.966 0 1.75.784 1.75 1.75v1a.75.75 0 0 1-1.5 0v-1a.25.25 0 0 0-.25-.25h-1a.75.75 0 0 1 0-1.5h1Z"></path>
                            <path d="M14.75 16.5a1.75 1.75 0 0 0 1.75-1.75v-1a.75.75 0 0 0-1.5 0v1a.25.25 0 0 1-.25.25h-1a.75.75 0 0 0 0 1.5h1Z"></path>
                            <path d="M11.75 4.25a.75.75 0 0 1-.75.75h-2a.75.75 0 0 1 0-1.5h2a.75.75 0 0 1 .75.75Z"></path>
                            <path d="M11 16.5a.75.75 0 0 0 0-1.5h-2a.75.75 0 0 0 0 1.5h2Z"></path>
                          </svg>
                        </button>
                      </li>
                      <li>
                        <button
                          className={`store-setting-icon store-icon ${
                            2 === activeIcon && active
                          }`}
                          onClick={() => handleIconClick("content2", 2)}
                          data-target="content2"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            className=""
                            width="24px"
                            height="24px"
                            focusable="false"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-1.5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                            ></path>
                            <path
                              fillRule="evenodd"
                              d="M9.377 2.5c-.926 0-1.676.75-1.676 1.676v.688c0 .056-.043.17-.198.251-.153.08-.303.168-.448.262-.147.097-.268.076-.318.048l-.6-.346a1.676 1.676 0 0 0-2.29.613l-.622 1.08a1.676 1.676 0 0 0 .613 2.289l.648.374c.048.028.124.12.119.29a5.484 5.484 0 0 0 .005.465c.009.175-.07.27-.119.299l-.653.377a1.676 1.676 0 0 0-.613 2.29l.623 1.08a1.676 1.676 0 0 0 2.29.613l.7-.405c.048-.028.166-.048.312.043.115.071.233.139.353.202.155.08.198.195.198.251v.811c0 .926.75 1.676 1.676 1.676h1.246c.926 0 1.676-.75 1.676-1.676v-.81c0-.057.042-.171.197-.252.121-.063.239-.13.354-.202.146-.091.264-.07.312-.043l.7.405a1.676 1.676 0 0 0 2.29-.614l.623-1.08a1.676 1.676 0 0 0-.613-2.289l-.653-.377c-.05-.029-.128-.123-.119-.3a5.494 5.494 0 0 0 .005-.463c-.005-.171.07-.263.12-.291l.647-.374a1.676 1.676 0 0 0 .613-2.29l-.623-1.079a1.676 1.676 0 0 0-2.29-.613l-.6.346c-.049.028-.17.048-.318-.048a5.4 5.4 0 0 0-.448-.262c-.155-.081-.197-.195-.197-.251v-.688c0-.926-.75-1.676-1.676-1.676h-1.246Zm-.176 1.676c0-.097.078-.176.176-.176h1.246c.097 0 .176.079.176.176v.688c0 .728.462 1.298 1.003 1.58.11.058.219.122.323.19.517.337 1.25.458 1.888.09l.6-.346a.176.176 0 0 1 .24.064l.623 1.08a.176.176 0 0 1-.064.24l-.648.374c-.623.36-.888 1.034-.868 1.638a4.184 4.184 0 0 1-.004.337c-.032.615.23 1.31.867 1.677l.653.377a.176.176 0 0 1 .064.24l-.623 1.08a.176.176 0 0 1-.24.065l-.701-.405c-.624-.36-1.341-.251-1.855.069a3.91 3.91 0 0 1-.255.145c-.54.283-1.003.853-1.003 1.581v.811a.176.176 0 0 1-.176.176h-1.246a.176.176 0 0 1-.176-.176v-.81c0-.73-.462-1.3-1.003-1.582a3.873 3.873 0 0 1-.255-.146c-.514-.32-1.23-.428-1.855-.068l-.7.405a.176.176 0 0 1-.241-.065l-.623-1.08a.176.176 0 0 1 .064-.24l.653-.377c.637-.368.899-1.062.867-1.677a3.97 3.97 0 0 1-.004-.337c.02-.604-.245-1.278-.868-1.638l-.648-.374a.176.176 0 0 1-.064-.24l.623-1.08a.176.176 0 0 1 .24-.064l.6.346c.638.368 1.37.247 1.888-.09a3.85 3.85 0 0 1 .323-.19c.54-.282 1.003-.852 1.003-1.58v-.688Z"
                            ></path>
                          </svg>
                        </button>
                      </li>
                    </ul>
                  </div>
                  <aside className="main-sidebar">
                    <div
                      className={`sidebar-inner ${
                        activeContent === "content1" && "active"
                      }`}
                      id="content1"
                    >
                      <div className="sidebar-nav">
                        <h2 className="sidebar-title">Menu Settings</h2>
                      </div>
                      <div className="main-sidebar-content">
                        <div className="sidebar-top">
                          <div className="content-heading">
                            <Text as="h3" variant="heading2xl">
                              Setting
                            </Text>
                          </div>
                          <div className="card">
                            <div className="card-body">
                              <div className="card-content">
                                {palntype === "paid" && (
                                  <ul className="input-button">
                                    <ChoiceList
                                      title="Icon Type"
                                      choices={[
                                        { label: "Icon", value: "Icon" },
                                        { label: "Image", value: "Image" },
                                      ]}
                                      selected={selected}
                                      onChange={(value) => {
                                        handleChange(value);
                                      }}
                                    />
                                  </ul>
                                )}
                                {palntype === "paid" && (
                                  <BlockStack gap={400}>
                                    <RangeSlider
                                      label="Icon Size"
                                      value={iconsize}
                                      onChange={(value) => setIconsize(value)}
                                      min={0}
                                      max={50}
                                      output
                                    />
                                    <RangeSlider
                                      label="Text Size"
                                      value={Textsize}
                                      onChange={(value) => setTextsize(value)}
                                      output
                                      min={0}
                                      max={30}
                                    />
                                  </BlockStack>
                                )}
                                <Checkbox
                                  label="Show Menu Name"
                                  checked={menucheckbox}
                                  onChange={handlemenucheckbox}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="sidebar-template">
                          <div className="content-heading">
                            <Text as="h3" variant="heading2xl">
                              Menu
                            </Text>
                          </div>
                          {/* <!-- accordion  start--> */}
                          <div className="card">
                            <div className="card-body">
                              <div className="accordion">
                                <Modal
                                  size="large"
                                  open={active}
                                  onClose={toggleActive}
                                  title="Choose Icon"
                                >
                                  <Modal.Section>
                                    <InlineGrid columns={13}>
                                      {palntype === "Free" &&
                                        freeiconskey.map((key, id) => (
                                          <React.Fragment key={key}>
                                            <div
                                              className="icon-block"
                                              data-icon={key}
                                              dangerouslySetInnerHTML={{
                                                __html: SVG_ICON[key],
                                              }}
                                              onClick={() =>
                                                handleicon(key, id)
                                              }
                                            />
                                            {id === 1 && (
                                              <div className="unlock-pro-icon-btn">
                                                <Link
                                                  url={
                                                    upgradelink
                                                      ? upgradelink
                                                      : "#"
                                                  }
                                                  onClick={handleupgrade}
                                                >
                                                  Unlock pro features
                                                </Link>
                                              </div>
                                            )}
                                          </React.Fragment>
                                        ))}
                                    </InlineGrid>
                                    <InlineGrid columns={13}>
                                      {Object.keys(SVG_ICON).map((key, id) => (
                                        <div
                                          className="icon-block"
                                          data-icon={key}
                                          key={key}
                                          dangerouslySetInnerHTML={{
                                            __html: SVG_ICON[key],
                                          }}
                                          onClick={() => handleicon(key, id)}
                                        />
                                      ))}
                                    </InlineGrid>
                                  </Modal.Section>
                                </Modal>
                                {allSections.map((item, index) => (
                                  <div
                                    key={index}
                                    draggable
                                    onDragEnter={(e) => {
                                      dragOverItem.current = index;
                                      setdrag(true);
                                    }}
                                    onDragStart={(e) => {
                                      dragItem.current = index;
                                      setdrag(true);
                                    }}
                                    onDragEnd={() => {
                                      handleSort();
                                      setdrag(false);
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                  >
                                    <div className="item-at">
                                      <div
                                        className="title-at"
                                        onClick={toggleAccordion}
                                      >
                                        <h2>
                                          <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M6.75 3.5a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1Zm0 5a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1Zm-1 6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1Zm6.5-11a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1Zm-1 6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1Zm1 4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1Z"
                                              fill="#5C5F62"
                                            ></path>
                                          </svg>
                                          &nbsp;&nbsp;
                                          {!namevalue[`namevalue${item}`]
                                            ? `Menu
                                        ${index + 1}`
                                            : namevalue[`namevalue${item}`]}
                                        </h2>
                                        <Button
                                          variant="plain"
                                          icon={DeleteMinor}
                                          onClick={() =>
                                            handledeletemenu(
                                              `Menu${item}Icon`,
                                              index
                                            )
                                          }
                                        ></Button>
                                      </div>
                                      <div className="tab-at">
                                        <div className="accordion-content">
                                          <div className="form-wrapper">
                                            <label
                                              htmlFor="avatar"
                                              className="input-label"
                                            >
                                              Icon
                                            </label>
                                          </div>
                                          {!SelectedIcons[`Menu${item}Icon`] ? (
                                            <div className="file-wrapper htmlForm-input">
                                              {selected[0] === "Icon" ? (
                                                <Button
                                                  onClick={() =>
                                                    toggleActive(
                                                      `Menu${item}Icon`
                                                    )
                                                  }
                                                  variant="plain"
                                                >
                                                  Choose Icons
                                                </Button>
                                              ) : (
                                                <div
                                                  style={{
                                                    pointerEvents:
                                                      drag && "none",
                                                  }}
                                                >
                                                  {visible ? (
                                                    <Toast
                                                      content={rejectedFiles.map(
                                                        (file, index) =>
                                                          `"${file?.name}" is not supported. File type must be .gif, .jpg, .png, or .svg.`
                                                      )}
                                                      error="critical"
                                                    />
                                                  ) : null}
                                                  <DropZone
                                                    allowMultiple={false}
                                                    onDragOver={(e) => {
                                                      setdrag(true);
                                                    }}
                                                    onDrop={(
                                                      acceptedFiles,
                                                      rejectedFiles
                                                    ) => {
                                                      handleDropZoneDrop(
                                                        acceptedFiles,
                                                        rejectedFiles,
                                                        `Menu${item}Image`
                                                      );
                                                    }}
                                                  >
                                                    {
                                                      <div>
                                                        {!SelectedImage[
                                                          `Menu${item}Image`
                                                        ]?.name ? (
                                                          <Button>
                                                            AddImage
                                                          </Button>
                                                        ) : (
                                                          <Button>
                                                            ChangeImage
                                                          </Button>
                                                        )}
                                                        <Thumbnail
                                                          size="medium"
                                                          alt={
                                                            "gd"
                                                            // SelectedImage[
                                                            //   `Menu${item}Image`
                                                            // ]?.name
                                                          }
                                                          source={
                                                            getimage
                                                            // validImageTypes.includes(
                                                            //   SelectedImage[
                                                            //     `Menu${item}Image`
                                                            //   ]?.type
                                                            // )
                                                            //   ? window.URL?.createObjectURL(
                                                            //       SelectedImage[
                                                            //         `Menu${item}Image`
                                                            //       ]
                                                            //     )
                                                            //   : NoteMinor
                                                          }
                                                        />
                                                        {
                                                          // SelectedImage[
                                                          //   `Menu${item}Image`
                                                          // ]?.name
                                                        }
                                                      </div>
                                                    }
                                                  </DropZone>
                                                  <div className="Polaris-Choice__HelpText">
                                                    Upload an png,jpg,jpeg or
                                                    gif file (Max size 1MB)
                                                  </div>
                                                  <Button
                                                    variant="plain"
                                                    tone="critical"
                                                    onClick={() =>
                                                      handleremoveimage(
                                                        item,
                                                        index
                                                      )
                                                    }
                                                  >
                                                    remove
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <div className="Polaris-Header-Title--hasThumbnail">
                                              <div
                                                className="Polaris-Thumbnail Polaris-Thumbnail--sizeMedium"
                                                dangerouslySetInnerHTML={{
                                                  __html:
                                                    SVG_ICON[
                                                      SelectedIcons[
                                                        `Menu${item}Icon`
                                                      ]
                                                    ],
                                                }}
                                              />
                                              <div className="Polaris-Header-Title__TitleAndSubtitleWrapper">
                                                {
                                                  <Button
                                                    variant="plain"
                                                    onClick={() =>
                                                      toggleActive(
                                                        `Menu${item}Icon`
                                                      )
                                                    }
                                                  >
                                                    (change)
                                                  </Button>
                                                }
                                              </div>
                                              <div className="Polaris-Header-Title__TitleMetadata">
                                                <Button
                                                  variant="plain"
                                                  tone="critical"
                                                  onClick={() =>
                                                    handleremoveicon(
                                                      item,
                                                      index
                                                    )
                                                  }
                                                >
                                                  Remove
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                          <div className="form-wrapper">
                                            <TextField
                                              label="name"
                                              name={`namevalue${item}`}
                                              placeholder="shop"
                                              value={
                                                namevalue[`namevalue${item}`]
                                              }
                                              onChange={(addvalue) => {
                                                setNamevalue({
                                                  ...namevalue,
                                                  [`namevalue${item}`]:
                                                    addvalue,
                                                });
                                                setUnsavedChanges(true);
                                              }}
                                              clearButton
                                              onClearButtonClick={() =>
                                                setNamevalue({
                                                  ...namevalue,
                                                  [`namevalue${item}`]: "",
                                                })
                                              }
                                              autoComplete="on"
                                            />
                                          </div>
                                          <div className="form-wrapper">
                                            <TextField
                                              label="Link"
                                              placeholder="/collections/all"
                                              value={
                                                linkvalue[`linkvalue${item}`]
                                              }
                                              onChange={(addvalue) => {
                                                setLinkvalue({
                                                  ...linkvalue,
                                                  [`linkvalue${item}`]:
                                                    addvalue,
                                                });
                                                setUnsavedChanges(true);
                                              }}
                                              clearButton
                                              onClearButtonClick={() =>
                                                setLinkvalue({
                                                  ...linkvalue,
                                                  [`linkvalue${item}`]: "",
                                                })
                                              }
                                              autoComplete="on"
                                            />
                                          </div>
                                          {palntype !== "Free" && (
                                            <div>
                                              <div className="form-wrapper">
                                                <TextField
                                                  label={
                                                    <Tooltip
                                                      width="wide"
                                                      content="If you need extra functionality with
                                              the Mobile menu bar then add your ID
                                              here. For ex. You need to open a
                                              Cart drawer, Search, & etc on click."
                                                    >
                                                      <Text as="label">Id</Text>
                                                    </Tooltip>
                                                  }
                                                  placeholder="#id"
                                                  value={
                                                    idvalue[`idvalue${item}`]
                                                  }
                                                  onChange={(addvalue) => {
                                                    setIdvalue({
                                                      ...idvalue,
                                                      [`idvalue${item}`]:
                                                        addvalue,
                                                    });
                                                    setUnsavedChanges(true);
                                                  }}
                                                  clearButton
                                                  onClearButtonClick={() =>
                                                    setIdvalue({
                                                      ...idvalue,
                                                      [`idvalue${item}`]: "",
                                                    })
                                                  }
                                                  autoComplete="on"
                                                />
                                              </div>
                                              <div className="form-wrapper">
                                                <TextField
                                                  label={
                                                    <Tooltip
                                                      width="wide"
                                                      content="If you need extra functionality with
                                              the Mobile menu bar then add your CLASS
                                              here. For ex. You need to open a
                                              Cart drawer, Search, & etc on click."
                                                    >
                                                      <Text as="label">
                                                        Extra Class
                                                      </Text>
                                                    </Tooltip>
                                                  }
                                                  placeholder=".collections"
                                                  value={
                                                    classvalue[
                                                      `classvalue${item}`
                                                    ]
                                                  }
                                                  onChange={(addvalue) => {
                                                    setClassvalue({
                                                      ...classvalue,
                                                      [`classvalue${item}`]:
                                                        addvalue,
                                                    });
                                                    setUnsavedChanges(true);
                                                  }}
                                                  clearButton
                                                  onClearButtonClick={() =>
                                                    setClassvalue({
                                                      ...classvalue,
                                                      [`classvalue${item}`]: "",
                                                    })
                                                  }
                                                  autoComplete="on"
                                                />
                                              </div>
                                            </div>
                                          )}
                                          <div className="form-wrapper">
                                            <Checkbox
                                              label="Open link in a new tab"
                                              checked={
                                                linkcheckboxes[
                                                  `linkcheckbox${item}`
                                                ]
                                              }
                                              onChange={() =>
                                                handleCheckbox(item)
                                              }
                                            ></Checkbox>
                                            {palntype !== "Free" && (
                                              <Checkbox
                                                label="Enable Cart counter"
                                                checked={enablecartcounter}
                                                onChange={() =>
                                                  setenablecartcounter(
                                                    !enablecartcounter
                                                  )
                                                }
                                              ></Checkbox>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <div className="card-bottom">
                                  {allSections?.length < addsectionquan && (
                                    <a
                                      href="#"
                                      onClick={handleaddsection}
                                      className="add-section-link"
                                    >
                                      <span>
                                        <svg
                                          viewBox="0 0 20 20"
                                          className=""
                                          width="20px"
                                          height="20px"
                                          focusable="false"
                                          fill="#005bd3"
                                          aria-hidden="true"
                                        >
                                          <path d="M6.25 10a.75.75 0 0 1 .75-.75h2.25v-2.25a.75.75 0 0 1 1.5 0v2.25h2.25a.75.75 0 0 1 0 1.5h-2.25v2.25a.75.75 0 0 1-1.5 0v-2.25h-2.25a.75.75 0 0 1-.75-.75Z"></path>
                                          <path
                                            fillRule="evenodd"
                                            d="M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm0-1.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z"
                                          ></path>
                                        </svg>
                                      </span>
                                      Add menu
                                    </a>
                                  )}
                                  <Box paddingBlock={400}>
                                    <Card>
                                      <div className="Polaris-Card unlock-pro-features">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          xmlnsXlink="http://www.w3.org/1999/xlink"
                                          version="1.1"
                                          id="Capa_1"
                                          x="0px"
                                          y="0px"
                                          width="20px"
                                          height="20px"
                                          viewBox="0 0 475.075 475.075"
                                          style={{
                                            enableBackground:
                                              "new 0 0 475.075 475.075",
                                          }}
                                          xmlSpace="preserve"
                                        >
                                          <g>
                                            <path
                                              d="M475.075,186.573c0-7.043-5.328-11.42-15.992-13.135L315.766,152.6L251.529,22.694c-3.614-7.804-8.281-11.704-13.99-11.704   c-5.708,0-10.372,3.9-13.989,11.704L159.31,152.6L15.986,173.438C5.33,175.153,0,179.53,0,186.573c0,3.999,2.38,8.567,7.139,13.706   l103.924,101.068L86.51,444.096c-0.381,2.666-0.57,4.575-0.57,5.712c0,3.997,0.998,7.374,2.996,10.136   c1.997,2.766,4.993,4.142,8.992,4.142c3.428,0,7.233-1.137,11.42-3.423l128.188-67.386l128.197,67.386   c4.004,2.286,7.81,3.423,11.416,3.423c3.819,0,6.715-1.376,8.713-4.142c1.992-2.758,2.991-6.139,2.991-10.136   c0-2.471-0.096-4.374-0.287-5.712l-24.555-142.749l103.637-101.068C472.604,195.33,475.075,190.76,475.075,186.573z"
                                              fill="#5044E6"
                                            />
                                          </g>
                                        </svg>
                                        <Text variant="headingxl" as="h3">
                                          <span style={{ color: "#8692A6" }}>
                                            &nbsp;&nbsp;Add a new Menu
                                          </span>
                                        </Text>
                                        &nbsp;
                                        <Link url="https://menu.addigitech.com/user/charge.php?shop=mobile-menu-bar-staging.myshopify.com&amp;pro&amp;timestamp=1705495831">
                                          <Badge tone="info">premium</Badge>
                                        </Link>
                                      </div>
                                    </Card>
                                  </Box>
                                  <Button
                                    variant="primary"
                                    onClick={() => {
                                      setpalntype("paid");
                                      addsectionquan = 6;
                                    }}
                                    disabled={palntype === "paid"}
                                  >
                                    get premium
                                  </Button>
                                  <Card>
                                    <BlockStack gap={300}>
                                      <div style={{ display: "flex" }}>
                                        <Text as="p" variant="headingMd">
                                          Mobile menu branding
                                        </Text>
                                        <div className="end-toggle">
                                          <label className="ToggleSwitchContainer-sc-1i39xvn-0 dlHruQ">
                                            <div className="ToggleSwitchWrapper-sc-1i39xvn-1 cYFfWb">
                                              <input
                                                type="checkbox"
                                                onClick={() =>
                                                  window.Tawk_API?.toggle()
                                                }
                                              />
                                              <span className="switch">
                                                <span className="switch-toggle" />
                                              </span>
                                            </div>
                                          </label>
                                        </div>
                                      </div>
                                      <Text as="p" variant="headingSm">
                                        Remove Mobile Menu branding
                                      </Text>
                                      <Text as="p">
                                        Please contact support to verify your
                                        store for free.
                                      </Text>
                                    </BlockStack>
                                  </Card>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`sidebar-inner theme-settings ${
                        activeContent === "content2" && "active"
                      }`}
                      id="content2"
                    >
                      <div className="sidebar-nav">
                        <h2 className="sidebar-title">Theme settings</h2>
                      </div>
                      <div className="main-sidebar-content">
                        <div className="sidebar-template">
                          {/* <!-- accordion  start--> */}
                          <div className="card">
                            <div className="card-body">
                              <div className="accordion">
                                <div className="item-at">
                                  <div
                                    className="title-at"
                                    onClick={toggleAccordion}
                                  >
                                    <h2>Color</h2>
                                  </div>
                                  <div className="tab-at">
                                    <div className="accordion-content">
                                      <div className="htmlForm-wrapper htmlForm-control">
                                        <label className="input-label">
                                          Background color
                                        </label>
                                        <div className="htmlForm-input">
                                          <Button onClick={handleButtonClick}>
                                            <div
                                              className="mobile-menu-wrap"
                                              style={{
                                                backgroundColor: rgbStyle,
                                              }}
                                            ></div>
                                          </Button>
                                          {colorPickerVisible && (
                                            <div className="color-picker-div">
                                              <ColorPicker
                                                onChange={handleColorChange}
                                                color={selectedColor}
                                                allowAlpha
                                                id="color"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="htmlForm-wrapper htmlForm-control">
                                        <label className="input-label">
                                          Border color
                                        </label>
                                        <div className="htmlForm-input">
                                          <Button onClick={handleBordercolor}>
                                            <div
                                              className="mobile-menu-wrap"
                                              style={{
                                                backgroundColor: rgbbordercolor,
                                              }}
                                            ></div>
                                          </Button>
                                          {bordercolorPickerVisible && (
                                            <div className="color-picker-div">
                                              <ColorPicker
                                                onChange={
                                                  handleborderColorChange
                                                }
                                                color={borderColor}
                                                allowAlpha
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {selected[0] === "Icon" && (
                                        <div className="htmlForm-wrapper htmlForm-control">
                                          <label className="input-label">
                                            Icon color
                                          </label>
                                          <div className="htmlForm-input">
                                            <Button onClick={handleIconcolor}>
                                              <div
                                                className="mobile-menu-wrap"
                                                style={{
                                                  backgroundColor: rgbiconcolor,
                                                }}
                                              ></div>
                                            </Button>
                                            {iconcolorPickerVisible && (
                                              <div className="color-picker-div">
                                                <ColorPicker
                                                  onChange={
                                                    handleiconColorChange
                                                  }
                                                  color={IconColor}
                                                  allowAlpha
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      <div className="htmlForm-wrapper htmlForm-control">
                                        <label className="input-label">
                                          Text color
                                        </label>
                                        <div className="htmlForm-input">
                                          <Button onClick={handletextcolor}>
                                            <div
                                              className="mobile-menu-wrap"
                                              style={{
                                                backgroundColor: rgbtextcolor,
                                              }}
                                            ></div>
                                          </Button>
                                          {textcolorPickerVisible && (
                                            <div className="color-picker-div">
                                              <ColorPicker
                                                onChange={handletextColorChange}
                                                color={TextColor}
                                                allowAlpha
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {palntype !== "Free" && (
                                        <div>
                                          <div className="htmlForm-wrapper htmlForm-control">
                                            <label className="input-label">
                                              Cart Counter Background color
                                            </label>
                                            <div className="htmlForm-input">
                                              <Button
                                                onClick={() => {
                                                  setcartcountercolorPickerVisible(
                                                    !cartcountercolorPickerVisible
                                                  );
                                                  setcartcountertextcolorPickerVisible(
                                                    false
                                                  );
                                                  setColorPickerVisible(false);
                                                  settextcolorPickerVisible(
                                                    false
                                                  );
                                                  setbordercolorPickerVisible(
                                                    false
                                                  );
                                                  seticoncolorPickerVisible(
                                                    false
                                                  );
                                                  setColorPickerVisible(false);
                                                }}
                                              >
                                                <div
                                                  className="mobile-menu-wrap"
                                                  style={{
                                                    backgroundColor:
                                                      cartcountercolor,
                                                  }}
                                                ></div>
                                              </Button>
                                              {cartcountercolorPickerVisible && (
                                                <div className="color-picker-div">
                                                  <ColorPicker
                                                    onChange={
                                                      handlecartColorChange
                                                    }
                                                    color={cartColor}
                                                    allowAlpha
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="htmlForm-wrapper htmlForm-control">
                                            <label className="input-label">
                                              Cart Counter Text color
                                            </label>
                                            <div className="htmlForm-input">
                                              <Button
                                                onClick={() => {
                                                  setcartcountertextcolorPickerVisible(
                                                    !cartcountertextcolorPickerVisible
                                                  );
                                                  setcartcountercolorPickerVisible(
                                                    false
                                                  );
                                                  setColorPickerVisible(false);
                                                  settextcolorPickerVisible(
                                                    false
                                                  );
                                                  setbordercolorPickerVisible(
                                                    false
                                                  );
                                                  seticoncolorPickerVisible(
                                                    false
                                                  );
                                                  setColorPickerVisible(false);
                                                }}
                                              >
                                                <div
                                                  className="mobile-menu-wrap"
                                                  style={{
                                                    backgroundColor:
                                                      cartcountertextcolor,
                                                  }}
                                                ></div>
                                              </Button>
                                              {cartcountertextcolorPickerVisible && (
                                                <div className="color-picker-div">
                                                  <ColorPicker
                                                    onChange={
                                                      handlecarttextChange
                                                    }
                                                    color={countertextcolor}
                                                    allowAlpha
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="item-at">
                                  <div
                                    className="title-at"
                                    onClick={toggleAccordion}
                                  >
                                    <h2>Custom css</h2>
                                  </div>
                                  <div className="tab-at">
                                    <div className="accordion-content">
                                      <div className="htmlForm-wrapper">
                                        <div className="htmlForm-input">
                                          <TextField
                                            value={Customcssvalue}
                                            onChange={(newvalue) =>
                                              setCustomcssvalue(newvalue)
                                            }
                                            multiline={4}
                                            placeholder=".class { border-radius: 5px; }"
                                            autoComplete="on"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
              <main className="page-wrapper">
                <div className="page-content">
                  <div className="main-card">
                    <div className="preview-container">
                      <div className="top-bar"></div>
                      <div className="preview-container-inner">
                        <div className="mobile-menu-wrap">
                          <ul
                            className="mobile-bar-nav"
                            style={{
                              backgroundColor: rgbStyle,
                              borderColor: rgbbordercolor,
                            }}
                          >
                            {selected[0] === "Icon"
                              ? Object.keys(SelectedIcons).map(
                                  (menuitem, index) =>
                                    palntype === "Free" ? (
                                      index < 3 && (
                                        <li className="nav-grid" key={index}>
                                          <a href="#" className="nav-grid-icon">
                                            {console.log(
                                              cartcountertextcolor,
                                              cartcountercolor,
                                              "451++"
                                            )}
                                            {index === 2 && (
                                              <div
                                                className="cart-count-bubble"
                                                style={{
                                                  backgroundColor:
                                                    cartcountercolor,
                                                  color: cartcountertextcolor,
                                                }}
                                              >
                                                2
                                              </div>
                                            )}
                                            <div
                                              className={`menu-icon-${
                                                index + 1
                                              }`}
                                              dangerouslySetInnerHTML={{
                                                __html:
                                                  SVG_ICON[
                                                    SelectedIcons[menuitem]
                                                  ] || "",
                                              }}
                                            />
                                            {!SelectedIcons[menuitem] && (
                                              <div
                                                dangerouslySetInnerHTML={{
                                                  __html:
                                                    SVG_ICON[index + 1] || "",
                                                }}
                                              />
                                            )}
                                            {menucheckbox && (
                                              <span
                                                style={{ color: rgbtextcolor }}
                                              >
                                                {
                                                  namevalue[
                                                    `namevalue${menuitem?.match(
                                                      /\d+/
                                                    )}`
                                                  ]
                                                }
                                              </span>
                                            )}
                                          </a>
                                        </li>
                                      )
                                    ) : (
                                      <li className="nav-grid" key={index}>
                                        <a href="#" className="nav-grid-icon">
                                          <div
                                            className={`menu-icon-${index + 1}`}
                                            dangerouslySetInnerHTML={{
                                              __html:
                                                SVG_ICON[
                                                  SelectedIcons[menuitem]
                                                ] || "",
                                            }}
                                          />
                                          {index === 2 && (
                                            <div
                                              className="cart-count-bubble"
                                              style={{
                                                backgroundColor:
                                                  cartcountercolor,
                                                color: cartcountertextcolor,
                                              }}
                                            >
                                              2
                                            </div>
                                          )}
                                          {!SelectedIcons[menuitem] && (
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html:
                                                  SVG_ICON[index + 1] || "",
                                              }}
                                            />
                                          )}
                                          {menucheckbox && (
                                            <span
                                              style={{ color: rgbtextcolor }}
                                            >
                                              {
                                                namevalue[
                                                  `namevalue${menuitem?.match(
                                                    /\d+/
                                                  )}`
                                                ]
                                              }
                                            </span>
                                          )}
                                        </a>
                                      </li>
                                    )
                                )
                              : Object.keys(SelectedImage)?.map(
                                  (menuimage, index) => (
                                    <li className="nav-grid" key={index}>
                                      <BlockStack>
                                        <Thumbnail
                                          key={index}
                                          size="medium"
                                          alt={"SelectedImage[menuimage].name"}
                                          source={
                                            // getimage
                                            validImageTypes.includes(
                                              SelectedImage[menuimage]
                                            )
                                              ? window.URL?.createObjectURL(
                                                  SelectedImage[menuimage]
                                                )
                                              : NoteMinor
                                          }
                                        ></Thumbnail>
                                        {menucheckbox && (
                                          <span style={{ color: rgbtextcolor }}>
                                            {
                                              namevalue[
                                                `namevalue${menuimage?.match(
                                                  /\d+/
                                                )}`
                                              ]
                                            }
                                          </span>
                                        )}
                                      </BlockStack>
                                    </li>
                                  )
                                )}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="ad-branding">
                      <a
                        href="https://apps.shopify.com/partners/ad-digitech"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img src={poweredByImage} alt="" />
                      </a>
                    </div>
                  </div>
                  <br></br>
                  <BlockStack inlineAlign="center">
                    <Button variant="primary" size="large" onClick={handleSave}>
                      Save
                    </Button>
                  </BlockStack>
                </div>
              </main>
            </div>
          </React.Fragment>
        ) : (
          <Spinner accessibilityLabel="Spinner example" size="large" />
        )}
      </Frame>
    </div>
  );
};

export default Customise;
