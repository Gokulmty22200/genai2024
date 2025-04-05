!pip install diagrams

from diagrams import Diagram, Cluster, Edge

from diagrams.aws.general import Users as InternetUsers

from diagrams.aws.general import User as HomeUser

from diagrams.aws.general import Users as OfficeUsers

from diagrams.aws.general import OfficeBuilding as CorporateDC

from diagrams.aws.general import InternetAlt2 as internet

from diagrams.aws.network import Route53

from diagrams.aws.compute import EC2Instance as InternetWebClient

from diagrams.aws.network import VpnGateway

from diagrams.aws.network import DirectConnect

from diagrams.aws.compute import EC2Instance as BastionHost

from diagrams.aws.network import ALB as LoadBalancer

from diagrams.aws.compute import EC2Instance as AppCore

from diagrams.aws.database import Database as DB

from diagrams.aws.network import NATGateway , InternetGateway

from diagrams.aws.security import IAM

from diagrams.aws.security import IdentityAndAccessManagementIamRole as Role

from diagrams.aws.management import Cloudwatch

from diagrams.aws.security import CloudHSM

from diagrams.aws.security import AdConnector as ADServices

from diagrams.aws.network import Endpoint

from diagrams.aws.storage import S3

from diagrams.aws.security import WAF

from diagrams.onprem.compute import Server as WebApp

 

graph_attr = {

    "fontsize": "40",

    "compund": "True",

    "splines":"spline",

}

cluster_attr = {

    "fontsize": "30",

}

node_attr = {

    "fontsize": "20",

    "height": "10.6",

}

edge_attr = {

    "fontsize": "20",

    "minlen": "1",

    "penwidth":"1",

    "concentrate": "true"

}

 

with Diagram("\n\nIconWorks Application Architecture", show=False , graph_attr=graph_attr, edge_attr=edge_attr, node_attr=node_attr, direction="LR", outformat="png", filename="the_final_icon_architecture") as diag:

   

    iu = InternetUsers("\nInternet \nUsers")

    internet = internet("\nInternet")

    waf = WAF("\nWAF")

    r_f= Route53("\nRoute \n53 DNS")

    ig = InternetGateway("\nInternet \nGW")

    cdc = CorporateDC("\nCorporate \nDC")

    vg = VpnGateway("\nVPN \nGateway")

    dic = DirectConnect("\nDirect \nConnect")

    hu = HomeUser("\nHome \nUsers")

    ou = OfficeUsers("\nOffice \nUsers")

 

    iu >> internet

    r_f >> internet

    internet >> waf

   

    waf >> ig

    cdc >> dic

 

    ou >> dic

    hu >> vg

   

    with Cluster("Region A" , direction = "LR") as r1:

             

        with Cluster("Availability Zone A" , direction="TB" , graph_attr={"nodesep": "0.8", "ranksep": "1.2"}) as az:

 

             with Cluster("Data Zone") as dz:

                            db1=DB("\nMSSQL & \nMySQL 01")

                            db2=DB("\nMSSQL & \nMySQL 02")

                            db_g =[db1,db2]

           

             lb = LoadBalancer("\nLoad \nBalancer 01")

             with Cluster("Web Zone") as wz:

                wa1 = WebApp("\nWeb App 01")

                wa2 = WebApp("\nWeb App 02")

                wa_g = [wa1,wa2]

 

             with Cluster("Application Zone") as az:

                ap1 = AppCore("\nApp Core 01")

                ap2 = AppCore("\nApp Core 02")

                apg = [ap1,ap2]

 

        with Cluster("Public Zone") as pz:

            bh = BastionHost("\nBastion \nHost")        

             

    wa1 >> ap1

    wa2 >> ap2

    wa1 >> ap2

    wa2 >> ap1

 

   

    ap1 >> db1

    ap2 >> db2

    ap2 >> db1

    ap1 >> db2

 

    lb >> wa_g

    dic >> bh

   

    ig >> lb

    vg >> bh