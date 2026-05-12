import DropdownLinks_S from "./Styles/DropdownLinks.module.css";

//Creates a dropdown list of links
function DropdownLinks(Q) {

    const DropdownLinks_Device = [DropdownLinks_S.Computer, DropdownLinks_S.Mobile];
    const DropdownLinks_Mode = [DropdownLinks_S.Public, DropdownLinks_S.Private];

    //Opens a new tab based on provided link(s)
    //L = A link or an array of links
    function OpenNewTab(L) {
        let Links = [];
        if (!Array.isArray(L)) {
            Links = [L];
        }
        else if (Array.isArray(L)) {
            Links = L;
        }
        for (let i = 0; i < Links.length; i++) {
            if (typeof window !== 'undefined') {
                const newTab = window.open(Links[i], '_blank', 'noopener, noreferrer');
                if (newTab) {
                    newTab.focus();
                }
            }
            else {
                console.warn("Warning: OpenNewTab was called outside of a browser environment.");
            }
        }
    }

    //Creates title portion of dropdown bookmarks
    //Data = JSON of bookmark information
    function CreateTitle(Data) {
        if (Data.Shortcut != false) {
            return (
                <div className={DropdownLinks_S.Title} style={{ cursor: "pointer" }} onClick={() => OpenNewTab(Data.Shortcut)}>
                    {Data.Title}
                </div>
            );
        }
        else if (Data.Marks.length == 1) {
            return (
                <div className={DropdownLinks_S.Title} style={{ cursor: "pointer" }} onClick={() => OpenNewTab(Data.Marks[0].Link)}>
                    {Data.Marks[0].Label}
                </div>
            );
        }
        else {
            return (
                <div className={DropdownLinks_S.Title}>
                    {Data.Title}
                </div>
            );
        }
    }

    return (
        <div className={`${DropdownLinks_Device[Q.Device]} ${DropdownLinks_Mode[Q.Mode]}`}>

            {CreateTitle(Q.Data)}

            {Q.Data.Marks.length > 1 ?
                Q.Data.Marks.map((mark, index) => (
                    <div key={index} className={DropdownLinks_S.Link} onClick={() => OpenNewTab(mark.Link)}>
                        {mark.Label}
                    </div>
                ))
                :
                null}

        </div>
    );
}

export { DropdownLinks };