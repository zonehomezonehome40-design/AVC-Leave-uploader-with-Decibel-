(async()=>{
    // Page URL check (robust)
    if(!location.href.startsWith("https://hrms1.mydecibel.com/TMS/AVCD_BulkLeaves.aspx")){
        let p=document.createElement("div");
        p.textContent="Not Allowed";
        p.style="position:fixed;top:20px;left:50%;transform:translateX(-50%);background:red;color:#fff;padding:12px 25px;border-radius:8px;font-family:sans-serif;font-size:16px;z-index:999999;";
        document.body.appendChild(p);
        setTimeout(()=>p.remove(),2000);
        return;
    }

    // Load XLSX library if not present
    if(!window.XLSX){
        let s=document.createElement('script');
        s.src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
        document.body.appendChild(s);
        await new Promise(r=>s.onload=r);
    }

    // Create modal
    let c=document.createElement('div');
    c.style="position:fixed;top:5%;left:50%;transform:translateX(-50%);background:#fff;padding:40px 30px 30px 30px;z-index:999999;box-shadow:0 0 40px 10px rgba(0,0,0,0.8);border-radius:20px;text-align:center;font-family:sans-serif;min-width:500px;";
    c.innerHTML=`...`; // Same modal HTML
    document.body.appendChild(c);

    // Close button
    document.getElementById('closeBtn').onclick=()=>c.remove();

    // Download template
    document.getElementById('dl').onclick=()=>{
        let wb=XLSX.utils.book_new();
        let ws=XLSX.utils.aoa_to_sheet([["Emp ID","Attendance Date","Leave Type","Remarks"]]);
        XLSX.utils.book_append_sheet(wb,ws,"Template");
        XLSX.writeFile(wb,"Leave_Template.xlsx");
    };

    // Export table to Excel
    document.getElementById('ex').onclick=()=>{
        let t=document.querySelector("table") || document.querySelector("table#desiredTableId");
        if(!t){alert("❌ Table not found");return;}
        let csv=[...t.rows].map(r=>[...r.cells].map(c=>`"${c.innerText.trim().replace(/"/g,'""')}"`).join("\t")).join("\n");
        let a=document.createElement("a");
        a.href="data:application/vnd.ms-excel,"+encodeURIComponent(csv);
        a.download="Crystal_Report_Export.xls";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Upload Excel
    document.getElementById("up").onchange=async e=>{
        let f=e.target.files[0];
        if(!f) return;
        let wb=XLSX.read(await f.arrayBuffer(),{type:"array"});
        let rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1}).slice(1).filter(r=>r[0]&&r[1]&&r[2]&&r[3]);
        let rejected=[],i=0;
        let search=document.querySelector("input.form-control.form-control-sm[type='search']") || document.querySelector("input[type='search']");
        if(!search){alert("❌ Search box not found");return;}
        (function next(){
            if(i>=rows.length){
                if(rejected.length){
                    let a=document.createElement("a");
                    a.href=URL.createObjectURL(new Blob(["EmployeeID,Date,LeaveCode,Remark\n"+rejected.map(r=>r.map(v=>`"${v}"`).join(",")).join("\n")],{type:"text/csv"}));
                    a.download="Rejected_Leave_Entries.csv";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
                c.remove();
                return;
            }
            let [id,date,leave,remark]=rows[i++];
            search.value=id;
            search.dispatchEvent(new Event("input"));
            setTimeout(()=>{
                let found=false;
                document.querySelectorAll("table tbody tr").forEach(r=>{
                    let t=r.innerText.replace(/\s+/g," ");
                    if(t.includes(id)&&t.includes(date)){
                        let cb=r.querySelector("input[type='checkbox']");
                        cb&&!cb.checked&&cb.click();
                        let s=r.querySelector("select");
                        s&&(s.value=leave,s.dispatchEvent(new Event("change",{bubbles:true})));
                        let i=r.querySelectorAll("input[type='text']");
                        i.length&&(i[i.length-1].value=remark,i[i.length-1].dispatchEvent(new Event("input",{bubbles:true})));
                        found=true;
                    }
                });
                if(!found) rejected.push([id,date,leave,"Emp not found"]);
                next();
            },500);
        })();
    };
})();
